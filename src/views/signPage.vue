<template>
  <div>

    <div class="backGroud" v-if="showGround" @click="closeSign"></div>

    <div class="landscape-signature" :hidden="showSignCanvas">
      <canvas ref="canvas" class="landscape-canvas"></canvas>
      <br>
      <el-button @click="clearSignature" type="danger">清除</el-button>
      <el-button @click="saveSignature" type="primary">确认</el-button>
      <div style="margin-bottom: 10px"></div>
    </div>
    <div class="pdf-preview scalable">
      <pdf
        :src="this.templateUrl"
        :scale="2"
        :enable-browser-style="true"
      ></pdf>
    </div>
    <div class="fixed-button" :hidden="signButton">
      <el-button class="primaryButton" @click="showCanvas()" type="info">签名</el-button>
      <el-button class="primaryButton" @click="saveContract()" type="primary">提交</el-button>
    </div>
  </div>
</template>

<script>
import {getWxUserInfo, getContractTemplate, getCodeUrl, saveContract} from "@/api/contract/wechat";
import Cookies from "js-cookie";
import pdf from 'vue-pdf'
import SignaturePad from 'signature_pad';
import {PDFDocument} from 'pdf-lib';

export default {
  components: {
    pdf,
    SignaturePad
  },
  name: "SignContract",
  data() {
    return {
      openId: "",
      nickname: "",
      code: "",
      templateUrl: "",
      showGround: false,
      showSignCanvas: true,
      signatureData: null, // 用于存储签名的数据
      savedSignature: null, // 用于存储保存后的签名图像
      originWidth: null,
      originHeight: null,
      pdfDoc: null,
      signatureImage: null,
      contractContent: null,
      signButton: true
    };
  },
  watch: {
    $route: {
      handler: function (route) {

      },
      immediate: true
    }
  },
  async mounted() {


    // // 获取缓存的openId
    // this.getCookieOpenId();
    //
    // this.code = this.$route.query && this.$route.query.code || '';
    //
    // // 获取用户信息
    // console.log(this.openId)
    // if (this.openId.length === 0 && this.code.length > 0) {
    //   await this.getWxUserInfo(this.code)
    //   return;
    // }
    //
    // // 获取code
    // if (this.openId.length <= 0 && (this.code === "" || this.code === undefined || this.code == null)) {
    //   this.getCode();
    //   return;
    // }

    // 获取当前开启的合同模版
    await this.getContractTemplate({openid: "1"});


    // 在组件挂载后初始化签名画布
    this.originWidth = this.$refs.canvas.width
    this.originHeight = this.$refs.canvas.height
    this.signaturePad = new SignaturePad(this.$refs.canvas);
  },
  created() {
  },
  methods: {

    saveContract() {

      if (this.templateUrl) {
        // 使用Fetch API下载文件
        fetch(this.templateUrl)
          .then(response => response.blob())
          .then(blob => {
            // 创建FormData对象
            let formData = new FormData();
            formData.append('file', blob, this.nickname + '的合同.pdf');
            formData.append('openid', this.openId);
            // 使用axios或其他HTTP库将文件上传到服务器
            saveContract(formData).then(response => {
              // 文件上传成功
              this.$message.success("合同签署成功")

              this.goHomeUrl();
            }).catch(error => {
              // 文件上传失败
              console.error('文件上传失败:', error);
            });
          })
          .catch(error => {
            console.error('文件下载失败:', error);
          }).finally(e => {
        });
      }

    },
    showCanvas() {
      this.showSignCanvas = false;
      this.showGround = true;
    },
    clearSignature() {
      // 清除签名
      this.signaturePad.clear();
    },
    async saveSignature() {

      // 保存签名为图像
      const signatureDataUrl = this.signaturePad.toDataURL();

      let context = this.$refs.canvas.getContext('2d');

      // 获取canvas上指定区域的像素数据
      let imageData = context.getImageData(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
      let data = imageData.data;

      // 遍历像素数据，检查alpha通道值
      let hasSignature = false;
      for (let i = 0; i < data.length; i += 4) {
        // 如果alpha通道值大于0，则认为有签字
        if (data[i + 3] > 0) {
          hasSignature = true;
          break;
        }
      }

      if (!hasSignature) {
        this.$message.error("签名内容不能为空")
        return;
      }


      const pngImageBytes = await fetch(signatureDataUrl).then(response => response.arrayBuffer());
      const pngImage = await this.pdfDoc.embedPng(pngImageBytes);

      // 获取PDF文档的页面
      const imgField = this.pdfDoc.getForm().getTextField('signUrl');

      if (imgField) {
        imgField.setImage(pngImage);
      } else {
        this.$message.error("签名无法保存到合同中，请联系管理员")
        return;
      }


      // 自动添加时间
      const timeField = this.pdfDoc.getForm().getTextField('signTime'); // 获取名为 "signUrl" 的文本字段
      if (timeField) {
        // 获取当前日期
        const currentDate = new Date();

        // 获取年、月、日
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需加 1，并补零
        const day = String(currentDate.getDate()).padStart(2, '0'); // 补零

        // 格式化日期字符串
        const formattedDate = year + " / " + month + " / " + day;
        timeField.setText(formattedDate);
      }


      const pdfBytes = await this.pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], {type: 'application/pdf'});

      this.contractContent = pdfBytes;
      this.templateUrl = URL.createObjectURL(pdfBlob);

      this.closeSign();

      console.log('保存的签名:', signatureDataUrl);
    },

    closeSign() {
      this.showSignCanvas = true
      this.showGround = false
      this.clearSignature();
    },

    getCode() {
      getCodeUrl().then(res => {
        console.log(res)
        // 使用打开新页面
        window.location.href = res.data.codeUrl;
      })
    },
    getCookieOpenId() {
      this.openId = Cookies.get("wxUserInfoOpenId") || '';
      this.nickname = Cookies.get("wxUserInfoNickname") || '';
    },
    getWxUserInfo(code) {
      getWxUserInfo(code).then(res => {
        Cookies.set("wxUserInfoOpenId", res.data.openid);
        Cookies.set("wxUserInfoNickname", res.data.nickname);

        this.openId = res.data.openid
        this.nickname = res.data.nickname
        this.goHomeUrl();
      }).catch(e => {
        console.log(e)
      })
    },
    getContractTemplate(data) {
      getContractTemplate(data).then(res => {
        this.templateUrl = res.data.templateUrl
        this.loadPdfDoc(this.templateUrl);

        if (res.data.type === "2") {
          this.signButton = true;
        } else {
          this.signButton = false
        }
      }).catch(error => {
      });
    },
    async loadPdfDoc(pdfUrl) {
      // 加载现有的PDF文档
      const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
      this.pdfDoc = await PDFDocument.load(existingPdfBytes);
    },
    goHomeUrl() {
      window.location.href = "signPage";
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">

.landscape-signature {
  width: 80vh;
  height: 80vw;
  border-radius: 5px;
  background-color: white;
  z-index: 99;
  border: 1px #5a5e66 solid;
  position: fixed;
  top: 120px; /* 或者您想要的距离底部的像素值 */
  left: -50px; /* 将按钮放置在页面水平中间 */
  //transform: translateY(-50%);
  transform: rotate(90deg);
}

.landscape-canvas {
  width: 80vh;
  height: 65vw;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 10px;
}


.fixed-button {
  width: 50%;
  /* 固定按钮到底部 */
  position: fixed;
  bottom: 20px; /* 或者您想要的距离底部的像素值 */
  left: 50%; /* 将按钮放置在页面水平中间 */
  transform: translateX(-50%);
}

.backGroud {
  width: 100%;
  height: 1000px;
  z-index: 10;
  position: fixed;
  background-color: #ecefef;
  opacity: 0.5;
  bottom: 0; /* 或者您想要的距离底部的像素值 */
  left: 0; /* 将按钮放置在页面水平中间 */
}

.scalable {
  transition: transform 0.3s ease;
}

.scalable:hover {
  transform: scale(1.2);
}
</style>
