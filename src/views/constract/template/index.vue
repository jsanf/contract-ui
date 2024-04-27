<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="模版名称" prop="templateName">
        <el-input
          v-model="queryParams.templateName"
          placeholder="请输入模版名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
<!--      <el-form-item label="模版文件" prop="templateUrl">-->
<!--        <el-input-->
<!--          v-model="queryParams.templateUrl"-->
<!--          placeholder="请输入模版文件"-->
<!--          clearable-->
<!--          @keyup.enter.native="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['constract:template:add']"
        >新增</el-button>
      </el-col>
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="success"-->
<!--          plain-->
<!--          icon="el-icon-edit"-->
<!--          size="mini"-->
<!--          :disabled="single"-->
<!--          @click="handleUpdate"-->
<!--          v-hasPermi="['constract:template:edit']"-->
<!--        >修改</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="danger"-->
<!--          plain-->
<!--          icon="el-icon-delete"-->
<!--          size="mini"-->
<!--          :disabled="multiple"-->
<!--          @click="handleDelete"-->
<!--          v-hasPermi="['constract:template:remove']"-->
<!--        >删除</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="warning"-->
<!--          plain-->
<!--          icon="el-icon-download"-->
<!--          size="mini"-->
<!--          @click="handleExport"-->
<!--          v-hasPermi="['constract:template:export']"-->
<!--        >导出</el-button>-->
<!--      </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="templateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
<!--      <el-table-column label="" align="center" prop="templateId" />-->
      <el-table-column label="模版名称" align="center" prop="templateName" />
      <el-table-column label="模版上传时间" align="center" prop="createTime" />
      <el-table-column label="签署数量" align="center" prop="signNumber" />
      <el-table-column label="模版文件" align="center" prop="templateUrl" >
        <template slot-scope="scope">
          <el-link :href="scope.row.templateUrl" target="_blank">
            <el-button type="text" > 模版文件预览</el-button>
          </el-link>
        </template>
      </el-table-column>

      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="1"
            inactive-value="0"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>


      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['constract:template:edit']"
          >修改</el-button>
          <el-button
            disabled
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['constract:template:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改合同模版库对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="模版名称" prop="templateName">
          <el-input v-model="form.templateName" placeholder="请输入模版名称" />
        </el-form-item>
        <el-form-item label="模版文件" prop="templateUrl">
          <el-upload
            multiple
            :action="uploadFileUrl"
            :before-upload="handleBeforeUpload"
            :file-list="fileList"
            :limit="limit"
            :on-error="handleUploadError"
            :on-exceed="handleExceed"
            :on-success="handleUploadSuccess"
            :show-file-list="false"
            :headers="headers"
            class="upload-file-uploader"
            ref="fileUpload"
          >
            <!-- 上传按钮 -->
            <el-button size="mini" type="primary">选取文件</el-button>
            <!-- 上传提示 -->
            <div class="el-upload__tip" slot="tip" v-if="showTip">
              请上传
              <template v-if="fileType"> 格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
              的文件
            </div>
          </el-upload>
          <!-- 文件列表 -->
          <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
            <li :key="file.url" class="el-upload-list__item ele-upload-list__item-content" v-for="(file, index) in fileList">
              <el-link :href="`${baseUrl}${file.url}`" :underline="false" target="_blank">
                <span class="el-icon-document"> {{ getFileName(file.name) }} </span>
              </el-link>
              <div class="ele-upload-list__item-content-action">
                <el-link :underline="false" @click="handleDeleteFile(index)" type="danger">删除</el-link>
              </div>
            </li>
          </transition-group>
<!--          <el-input v-model="form.templateUrl" placeholder="请输入模版文件" />-->
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTemplate, getTemplate, delTemplate, addTemplate, updateTemplate, changeContractTemplateStatus } from "@/api/constract/template";
import { getToken } from "@/utils/auth";
export default {
  name: "Template",
  props: {
    // 值
    value: [String, Object, Array],
    // 数量限制
    limit: {
      type: Number,
      default: 1,
    },
    // 大小限制(MB)
    fileSize: {
      type: Number,
      default: 20,
    },
    // 文件类型, 例如['png', 'jpg', 'jpeg']
    fileType: {
      type: Array,
      default: () => ["pdf"],
    },
    // 是否显示提示
    isShowTip: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      number: 0,
      uploadList: [],
      baseUrl: process.env.VUE_APP_BASE_API,
      uploadFileUrl: process.env.VUE_APP_BASE_API + "/common/upload", // 上传文件服务器地址
      headers: {
        Authorization: "Bearer " + getToken(),
      },
      // 是否显示提示
      isShowTip: {
        type: Boolean,
        default: true
      },
      fileList: [],
      // 文件类型, 例如['png', 'jpg', 'jpeg']
      showTip: "",
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 合同模版库表格数据
      templateList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        templateName: null,
        templateUrl: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        templateName: [
          { required: true, message: "模版名称不能为空", trigger: "blur,change" }
        ],
        templateUrl: [
          { required: true, message: "模版文件不能为空", trigger: "blur,change" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 删除文件
    handleDeleteFile(index) {
      this.fileList.splice(index, 1);
      this.form.templateUrl = null;
      this.$emit("input", this.listToString(this.fileList));
    },
    // 上传前校检格式和大小
    handleBeforeUpload(file) {
      // 校检文件类型
      if (this.fileType) {
        const fileName = file.name.split('.');
        const fileExt = fileName[fileName.length - 1];
        const isTypeOk = this.fileType.indexOf(fileExt) >= 0;
        if (!isTypeOk) {
          this.$modal.msgError(`文件格式不正确, 请上传${this.fileType.join("/")}格式文件!`);
          return false;
        }
      }
      // 校检文件大小
      if (this.fileSize) {
        const isLt = file.size / 1024 / 1024 < this.fileSize;
        if (!isLt) {
          this.$modal.msgError(`上传文件大小不能超过 ${this.fileSize} MB!`);
          return false;
        }
      }
      this.$modal.loading("正在上传文件，请稍候...");
      this.number++;
      return true;
    },
    // 文件个数超出
    handleExceed() {
      this.$modal.msgError(`上传文件数量不能超过 ${this.limit} 个!`);
    },
    // 上传失败
    handleUploadError(err) {
      this.$modal.msgError("上传文件失败，请重试");
      this.$modal.closeLoading();
    },
    // 上传成功回调
    handleUploadSuccess(res, file) {
      if (res.code === 200) {
        this.uploadList.push({ name: res.url, url: res.url });
        this.form.templateUrl = res.url;
        this.uploadedSuccessfully();
      } else {
        this.number--;
        this.$modal.closeLoading();
        this.$modal.msgError(res.msg);
        this.$refs.fileUpload.handleRemove(file);
        this.uploadedSuccessfully();
      }
    },
    // 上传结束处理
    uploadedSuccessfully() {
      if (this.number > 0 && this.uploadList.length === this.number) {
        this.fileList = this.fileList.concat(this.uploadList);
        this.uploadList = [];
        this.number = 0;
        this.$emit("input", this.listToString(this.fileList));
        this.$modal.closeLoading();
      }
    },
    // 获取文件名称
    getFileName(name) {
      // 如果是url那么取最后的名字 如果不是直接返回
      if (name.lastIndexOf("/") > -1) {
        return name.slice(name.lastIndexOf("/") + 1);
      } else {
        return name;
      }
    },
    // 对象转成指定字符串分隔
    listToString(list, separator) {
      let strs = "";
      separator = separator || ",";
      for (let i in list) {
        strs += list[i].url + separator;
      }
      return strs != '' ? strs.substr(0, strs.length - 1) : '';
    },
    // 模版状态修改
    handleStatusChange(row) {

      let text = row.status === "1" ? "启用" : "停用";

      this.$modal.confirm('确认要"' + text + '""' + row.templateName + '"合同模版吗？').then(function() {
        return changeContractTemplateStatus(row.templateId, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    /** 查询合同模版库列表 */
    getList() {
      this.loading = true;
      listTemplate(this.queryParams).then(response => {
        this.templateList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.fileList = []
      this.form = {
        templateId: null,
        templateName: null,
        templateUrl: null,
        status: null,
        createTime: null,
        updateTime: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.templateId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加合同模版库";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const templateId = row.templateId || this.ids
      this.fileList.push({ name: row.templateUrl, url: row.templateUrl });
      getTemplate(templateId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改合同模版库";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.templateId != null) {
            updateTemplate(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTemplate(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const templateIds = row.templateId || this.ids;
      this.$modal.confirm('是否确认删除"' + row.templateName + '"合同模版？').then(function() {
        return delTemplate(templateIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('constract/template/export', {
        ...this.queryParams
      }, `template_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
