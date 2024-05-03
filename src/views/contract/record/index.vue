<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="合同模版" prop="templateId">
        <el-select
          v-model="queryParams.templateId"
          placeholder="请选择合同模版"
          clearable
        >
          <el-option v-for="template in templateList" :key="template.templateId" :label="template.templateName" :value="template.templateId"/>
        </el-select>
      </el-form-item>
      <el-form-item label="签署时间" prop="signTime">
        <el-date-picker clearable
                        v-model="queryParams.signTime"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="请选择签署时间">
        </el-date-picker>
      </el-form-item>
<!--      <el-form-item label="签署人" prop="signUser">-->
<!--        <el-input-->
<!--          v-model="queryParams.signUser"-->
<!--          placeholder="请输入签署人"-->
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
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="primary"-->
<!--          plain-->
<!--          icon="el-icon-plus"-->
<!--          size="mini"-->
<!--          @click="handleAdd"-->
<!--          v-hasPermi="['contract:record:add']"-->
<!--        >新增</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="success"-->
<!--          plain-->
<!--          icon="el-icon-edit"-->
<!--          size="mini"-->
<!--          :disabled="single"-->
<!--          @click="handleUpdate"-->
<!--          v-hasPermi="['contract:record:edit']"-->
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
<!--          v-hasPermi="['contract:record:remove']"-->
<!--        >删除</el-button>-->
<!--      </el-col>-->
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['contract:record:export']"
        >批量导出合同</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
<!--      <el-table-column type="selection" width="55" align="center" />-->
<!--      <el-table-column label="序号" align="center" prop="id" />-->
      <el-table-column label="合同模版" align="center" prop="templateName" />
      <el-table-column label="签署日期" align="center" prop="signTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.signTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="微信uuid" align="center" prop="openid" />
      <el-table-column label="微信昵称" align="center" prop="nickname" />
      <el-table-column label="微信头像" align="center" prop="headImgUrl">
        <template slot-scope="scope">
          <el-image style="width: 50px" :src="scope.row.headImgUrl" />
        </template>
      </el-table-column>
      <el-table-column label="合同" align="center" prop="contractUrl" >
        <template slot-scope="scope">
          <el-link :href="scope.row.contractUrl" target="_blank">
            <el-button type="text" > 合同预览</el-button>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" v-if="false" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['contract:record:edit']"
          >修改</el-button>
          <el-button
            disabled
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['contract:record:remove']"
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

    <!-- 添加或修改签署记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关联的合同模版" prop="templateId">
          <el-input v-model="form.templateId" placeholder="请输入关联的合同模版" />
        </el-form-item>
        <el-form-item label="签署时间" prop="signTime">
          <el-date-picker clearable
                          v-model="form.signTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="请选择签署时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="签署人" prop="signUser">
          <el-input v-model="form.signUser" placeholder="请输入签署人" />
        </el-form-item>
        <el-form-item label="合同地址" prop="contractUrl">
          <el-input v-model="form.contractUrl" type="textarea" placeholder="请输入内容" />
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
import { listRecord, getRecord, delRecord, addRecord, updateRecord } from "@/api/contract/record";
import {listTemplate} from "@/api/contract/template";

export default {
  name: "Record",
  data() {
    return {
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
      // 签署记录表格数据
      recordList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 合同模版
      templateList:[],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        templateId: null,
        signTime: null,
        signUser: null,
        contractUrl: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        templateId: [
          { required: true, message: "关联的合同模版不能为空", trigger: "blur" }
        ],
        signTime: [
          { required: true, message: "签署时间不能为空", trigger: "blur" }
        ],
        signUser: [
          { required: true, message: "签署人不能为空", trigger: "blur" }
        ],
        contractUrl: [
          { required: true, message: "合同地址不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.queryTemplateList();
    this.getList();
  },
  methods: {
    queryTemplateList() {
      listTemplate({}).then(response => {
        this.templateList = response.rows;
      });
    },
    /** 查询签署记录列表 */
    getList() {
      this.loading = true;
      listRecord(this.queryParams).then(response => {
        this.recordList = response.rows;
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
      this.form = {
        id: null,
        templateId: null,
        signTime: null,
        signUser: null,
        contractUrl: null,
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加签署记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getRecord(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改签署记录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateRecord(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addRecord(this.form).then(response => {
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
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除签署记录编号为"' + ids + '"的数据项？').then(function() {
        return delRecord(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('contract/record/export', {
        ...this.queryParams
      }, `record_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
