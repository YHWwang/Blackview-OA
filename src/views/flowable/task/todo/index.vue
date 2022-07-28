<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="流程名称" prop="proDefId">
        <el-select
          v-model="queryParams.proDefId"
          placeholder="请选择流程名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        >
          <el-option
            v-for="item of flowSelectOption"
            :label="item.name"
            :key="item.proDefId"
            :value="item.proDefId"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <!-- <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:deployment:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row> -->

    <el-table
      v-loading="loading"
      :data="todoList"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        label="任务编号"
        align="center"
        prop="taskId"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="流程名称" align="center" prop="procDefName" />
      <el-table-column label="任务节点" align="center" prop="taskName" />
      <el-table-column label="流程版本" align="center">
        <template slot-scope="scope">
          <el-tag size="medium">v{{ scope.row.procDefVersion }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="流程发起人" align="center">
        <template slot-scope="scope">
          <label
            >{{ scope.row.startUserName }}
            <el-tag type="info" size="mini">{{
              scope.row.startDeptName
            }}</el-tag></label
          >
        </template>
      </el-table-column>
      <el-table-column
        label="接收时间"
        align="center"
        prop="createTime"
        width="180"
      />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="small"
            icon="el-icon-edit-outline"
            @click="handleProcess(scope.row)"
            >处理
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <Detali
      :open="detailOpen"
      :form="detailForm"
      :rows="rowData"
      @showCloseDialog="closeDialog"
      :status="true"
      :auditForm="auditForm"
    />
  </div>
</template>

<script>
import {
  todoList,
  getDeployment,
  delDeployment,
  exportDeployment,
} from "@/api/flowable/todo";
import { getForm, flowOption } from "@/api/flowable/task";
import Detali from "../detail.vue";

export default {
  name: "Deploy",
  components: {
    Detali,
  },
  data() {
    return {
      flowSelectOption: [],
      rowData: {},
      auditOpen: false,
      auditForm: {
        procDefKey: "",
        taskId: "",
        type: null,
        message: "",
      },
      meetingRoomIdOptions: [],
      activeName: "first",
      flowRecordList: [], // 流程流转数据
      detailOpen: false,
      detailForm: {
        procDefKey: "",
        process_id: "",
        img: null,
        meetingRoom: {
          attendees: null,
          topic: "",
          meetingRoomId: "",
          startTime: "",
          endTime: "",
        },
        carApply: {
          carId: "",
          startTime: "",
          destination: "",
          attendees: "",
          purpose: "",
        },
      },
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
      // 流程待办任务表格数据
      todoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        category: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
    };
  },
  mounted() {},
  created() {
    this.getList();
    this.getDicts("sys_meeting_room").then((response) => {
      this.meetingRoomIdOptions = response.data;
    });
    this.getFlowOption();
  },
  methods: {
    getFlowOption() {
      flowOption().then((res) => {
        this.flowSelectOption = res.data;
      });
    },
    closeDialog(key, value) {
      this.detailOpen = value;
    },
    /** 查询流程定义列表 */
    getList() {
      this.loading = true;
      todoList(this.queryParams).then((response) => {
        this.todoList = response.data.records;
        this.total = response.data.total;
        this.loading = false;
      });
    },

    // 处理按钮
    handleProcess(row) {
      this.detailOpen = true;
      this.rowData = row;
      getForm(row.procInsId).then((res) => {
        this.detailForm.img =
          process.env.VUE_APP_BASE_API +
          "/flowable/task/diagram/" +
          row.procInsId;
        this.detailForm.procDefKey = row.procDefKey;
        switch (
          this.detailForm.procDefKey //对应流程名称
        ) {
          case "meetingRoom":
            this.detailForm.meetingRoom.meetingRoomId = res.data.meetingRoomId;
            this.detailForm.meetingRoom.startTime = res.data.startTime;
            this.detailForm.meetingRoom.endTime = res.data.endTime;
            this.detailForm.meetingRoom.topic = res.data.topic;
            this.detailForm.meetingRoom.attendees = res.data.attendees;
            this.auditForm.taskId = row.taskId; //审核流程ID
            this.auditForm.procDefKey = row.procDefKey; //审核类型
            break;
          case "carApply":
            this.detailForm.carApply.carId = res.data.carId;
            this.detailForm.carApply.startTime = res.data.startTime;
            this.detailForm.carApply.destination = res.data.destination;
            this.detailForm.carApply.purpose = res.data.purpose;
            this.detailForm.carApply.attendees = res.data.attendees;
            this.auditForm.taskId = row.taskId; //审核流程ID
            this.auditForm.procDefKey = row.procDefKey; //审核类型
          default:
            break;
        }
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
        name: null,
        category: null,
        key: null,
        tenantId: null,
        deployTime: null,
        derivedFrom: null,
        derivedFromRoot: null,
        parentDeploymentId: null,
        engineVersion: null,
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
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加流程定义";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getDeployment(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改流程定义";
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm(
        '是否确认删除流程定义编号为"' + ids + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delDeployment(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有流程定义数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return exportDeployment(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        });
    },
  },
};
</script>

