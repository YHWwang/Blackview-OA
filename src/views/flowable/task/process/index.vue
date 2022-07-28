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
      <!-- <el-form-item label="开始时间" prop="deployTime">
        <el-date-picker
          clearable
          size="small"
          v-model="queryParams.deployTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择时间"
        >
        </el-date-picker>
      </el-form-item> -->
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:deployment:add']"
          >新增流程</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="myProcessList"
      border
      @selection-change="handleSelectionChange"
    >
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <el-table-column
        label="流程编号"
        align="center"
        prop="procInsId"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="流程名称"
        align="center"
        prop="procDefName"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="流程版本" align="center" width="80px">
        <template slot-scope="scope">
          <el-tag size="medium">v{{ scope.row.procDefVersion }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="提交时间"
        align="center"
        prop="createTime"
        width="180"
      />
      <el-table-column label="流程状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag
            :type="
              scope.row.status == 0
                ? 'danger'
                : scope.row.status == 1
                ? 'success'
                : 'error'
            "
            size="mini"
            >{{
              scope.row.status == 0
                ? "拒绝"
                : scope.row.status == 1
                ? "同意"
                : "进行中"
            }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column
        label="耗时"
        align="center"
        prop="duration"
        width="180"
      />
      <el-table-column label="当前节点" align="center" prop="taskName" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            icon="el-icon-tickets"
            type="small"
            @click.native="handleFlowRecord(scope.row)"
          >
            详情
          </el-button>
          <el-button
            icon="el-icon-delete"
            type="small"
            @click.native="handleDelete(scope.row)"
          >
            删除
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

    <!-- 发起流程 -->
    <el-dialog :title="title" :visible.sync="open" width="60%" append-to-body>
      <el-form
        :model="queryProcessParams"
        ref="queryProcessForm"
        :inline="true"
        v-show="showSearch"
        label-width="68px"
      >
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="queryProcessParams.name"
            placeholder="请输入名称"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="mini"
            @click="handleProcessQuery"
            >搜索</el-button
          >
          <el-button
            icon="el-icon-refresh"
            size="mini"
            @click="resetProcessQuery"
            >重置</el-button
          >
        </el-form-item>
      </el-form>
      <el-table v-loading="processLoading" fit :data="definitionList" border>
        <el-table-column label="流程名称" align="center" prop="name" />
        <el-table-column label="流程版本" align="center">
          <template slot-scope="scope">
            <el-tag size="medium">v{{ scope.row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="流程分类" align="center" prop="category" />
        <el-table-column
          label="操作"
          align="center"
          width="300"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit-outline"
              @click="handleStartProcess(scope.row)"
              >发起流程</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="processTotal > 0"
        :total="processTotal"
        :page.sync="queryProcessParams.pageNum"
        :limit.sync="queryProcessParams.pageSize"
        @pagination="listDefinition"
      />
    </el-dialog>
    <el-dialog
      title="发起流程"
      :visible.sync="newOpen"
      width="1000px"
      append-to-body
    >
      <el-form
        ref="processForm"
        :key="newOpen"
        :rules="processFormRules"
        :model="processForm"
        label-width="120px"
      >
        <!-- 会议室 -->
        <div v-if="processForm.flowKey === 'meetingRoom'">
          <el-form-item label="会议室" prop="meetingRoom.meetingRoomId">
            <el-select
              v-model="processForm.meetingRoom.meetingRoomId"
              placeholder="请选择会议室"
              clearable
              size="small"
            >
              <el-option
                v-for="item of meetingRoomIdOptions"
                :label="item.dictLabel"
                :key="item.dictValue"
                :value="item.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-row>
            <el-col :span="8">
              <el-form-item label="会议日期" prop="meetingRoom.date">
                <el-date-picker
                  v-model="processForm.meetingRoom.date"
                  type="date"
                  placeholder="选择日期"
                >
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="5.1" class="timeLabel">
              <el-form-item prop="meetingRoom.startTime">
                <el-time-select
                  placeholder="起始时间"
                  v-model="processForm.meetingRoom.startTime"
                  :picker-options="{
                    start: '09:00',
                    step: '00:10',
                    end: '21:00',
                    maxTime: processForm.meetingRoom.endTime,
                  }"
                >
                </el-time-select>
              </el-form-item>
            </el-col>
            <el-col :span="8" class="timeLabel2">
              <el-form-item prop="meetingRoom.endTime">
                <el-time-select
                  placeholder="结束时间"
                  v-model="processForm.meetingRoom.endTime"
                  :picker-options="{
                    start: '09:00',
                    step: '00:10',
                    end: '21:00',
                    minTime: processForm.meetingRoom.startTime,
                  }"
                >
                </el-time-select>
              </el-form-item>
            </el-col>
            <el-col v-if="meetingUsedTimeFlag" :span="24">
              <pie-chart :usedTimeData="meetingUsedTimeMsg" />
            </el-col>
          </el-row>
          <el-form-item label="会议主题" prop="meetingRoom.topic">
            <el-input
              v-model="processForm.meetingRoom.topic"
              placeholder="请输入会议主题"
              clearable
              size="small"
            />
          </el-form-item>

          <el-form-item label="会议参与人员" prop="meetingRoom.attendees">
            <el-transfer
              style="text-align: left; display: inline-block"
              v-model="attendees"
              filterable
              :render-content="renderFunc"
              :titles="['人员', '参与人员']"
              :button-texts="['移除', '参与']"
              :data="Userdata"
            >
            </el-transfer>
          </el-form-item>
        </div>
        <!-- 车辆预约 -->
        <div v-if="processForm.flowKey === 'carApply'">
          <el-form-item label="车辆信息" prop="carApply.carId">
            <el-select
              v-model="processForm.carApply.carId"
              placeholder="请选择车辆"
              clearable
              size="small"
            >
              <el-option
                v-for="item of carIdOptions"
                :label="item.dictLabel"
                :key="item.dictValue"
                :value="item.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="目的地" prop="carApply.destination">
            <el-input
              v-model="processForm.carApply.destination"
              placeholder="请输入目的地"
              clearable
              style="width: 215px"
              size="small"
            />
          </el-form-item>
          <el-form-item label="车辆用途" prop="carApply.purpose">
            <el-input
              v-model="processForm.carApply.purpose"
              placeholder="请输入车辆用途"
              clearable
              style="width: 500px"
              type="textarea"
              size="small"
            />
          </el-form-item>
          <el-form-item label="出发时间" prop="carApply.startTime">
            <el-date-picker
              v-model="processForm.carApply.startTime"
              type="datetime"
              format="yyyy-MM-dd HH:mm"
              placeholder="选择出发时间"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="同行人员" prop="carApply.attendees">
            <el-transfer
              style="text-align: left; display: inline-block"
              v-model="attendees"
              filterable
              :render-content="renderFunc"
              :titles="['人员', '同行人员']"
              :button-texts="['移除', '添加']"
              :data="Userdata"
            >
            </el-transfer>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="processSubmitForm">确 定</el-button>
        <el-button @click="newCancel">取 消</el-button>
      </div>
    </el-dialog>
    <Detali
      :open="detailOpen"
      :form="detailForm"
      :rows="rowData"
      @showCloseDialog="closeDialog"
    />
  </div>
</template>

<script>
import {
  getDeployment,
  addDeployment,
  updateDeployment,
  exportDeployment,
} from "@/api/flowable/finished";
import {
  pushProcess,
  getForm,
  delRecord,
  flowOption,
  meetingUsedTime,
} from "@/api/flowable/task";
import {
  myProcessList,
  stopProcess,
  attendeesList,
} from "@/api/flowable/process";
import { listDefinition } from "@/api/flowable/definition";
import Detali from "../detail.vue";
import { deepClone, formatDate2 } from "@/utils/index";
import PieChart from "@/views/dashboard/PieChart";
export default {
  name: "Deploy",
  components: {
    Detali,
    PieChart,
  },
  data() {
    return {
      renderFunc(h, option) {
        return <span style="font-size:12px">{option.label}</span>;
      },
      meetingUsedTimeMsg: [],
      meetingUsedTimeFlag: false,
      Userdata: [],
      carIdOptions: [],
      flowSelectOption: [],
      rowData: {},
      newOpen: false,
      attendees: [],
      processForm: {
        flowKey: "",
        process_id: "",
        meetingRoom: {
          meetingRoomId: "",
          startTime: "",
          endTime: "",
          date: "",
          attendees: null,
          topic: "",
        },
        carApply: {
          carId: "",
          startTime: "",
          destination: "",
          attendees: "",
          purpose: "",
        },
      },
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
      processLoading: true,
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
      processTotal: 0,
      // 我发起的流程列表数据
      myProcessList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      src: "",
      definitionList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        category: null,
        key: null,
        tenantId: null,
        deployTime: null,
        derivedFrom: null,
        derivedFromRoot: null,
        parentDeploymentId: null,
        engineVersion: null,
        proDefId: null,
      },
      // 查询参数
      queryProcessParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        category: null,
        key: null,
        tenantId: null,
        deployTime: null,
        derivedFrom: null,
        derivedFromRoot: null,
        parentDeploymentId: null,
        engineVersion: null,
        meetingRoomId: null,
        endTime: null,
        startTime: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
      meetingRoomIdOptions: [],
      processFormRules: {
        meetingRoom: {
          meetingRoomId: [
            { required: true, message: "请选择会议室", trigger: "blur" },
          ],
          topic: [
            { required: true, message: "请输入会议主题", trigger: "blur" },
          ],
          attendees: [
            { required: true, message: "请选择参与人员", trigger: "blur" },
          ],
          date: [
            { required: true, message: "请选择会议日期", trigger: "blur" },
          ],
          startTime: [
            { required: true, message: "请选择开始时间", trigger: "blur" },
          ],
          endTime: [
            { required: true, message: "请选择结束时间", trigger: "blur" },
          ],
        },
        carApply: {
          carId: [{ required: true, message: "请选择车辆", trigger: "blur" }],
          startTime: [
            { required: true, message: "请选择出发时间", trigger: "blur" },
          ],
          destination: [
            { required: true, message: "请选择目的地", trigger: "blur" },
          ],
          purpose: [{ required: true, message: "请选择用途", trigger: "blur" }],
        },
      },
    };
  },
  watch: {
    "processForm.meetingRoom.meetingRoomId": function (val, oldval) {
      if (val && val != oldval && this.processForm.meetingRoom.date) {
        this.getMeetingUsedTime();
      }
    },
    "processForm.meetingRoom.date": function (val, oldval) {
      if (val && val != oldval && this.processForm.meetingRoom.meetingRoomId) {
        this.getMeetingUsedTime();
      }
    },
  },
  mounted() {},
  created() {
    this.getList();
    this.getDicts("sys_meeting_room").then((response) => {
      this.meetingRoomIdOptions = response.data;
    });
    this.getDicts("sys_car_info").then((response) => {
      this.carIdOptions = response.data;
    });
    this.getFlowOption();
  },
  methods: {
    getMeetingUsedTime() {
      let data = {
        meetingRoomId: this.processForm.meetingRoom.meetingRoomId,
        applyDate: this.processForm.meetingRoom.date,
      };
      meetingUsedTime(data).then((res) => {
        this.meetingUsedTimeMsg = res.data;
        this.meetingUsedTimeFlag = true;
      });
    },
    closeDialog(value) {
      this.detailOpen = value;
    },
    getFlowOption() {
      flowOption().then((res) => {
        this.flowSelectOption = res.data;
      });
    },

    processSubmitForm() {
      //发起流程提交按钮
      let users = deepClone(this.attendees);
      this.$set(this.processForm.meetingRoom, "attendees", users.join(","));
      this.$refs["processForm"].validate((valid) => {
        if (valid) {
          let apiQuery = {};
          switch (this.processForm.flowKey) {
            case "meetingRoom":
              if (this.processForm.meetingRoom.date) {
                let date = formatDate2(this.processForm.meetingRoom.date) + " ";
                this.processForm.meetingRoom.startTime =
                  date + this.processForm.meetingRoom.startTime;
                this.processForm.meetingRoom.endTime =
                  date + this.processForm.meetingRoom.endTime;
              }

              apiQuery = this.processForm.meetingRoom;
              break;
            case "carApply":
              this.processForm.carApply.attendees = users.join(",");
              apiQuery = this.processForm.carApply;
              break;
            default:
              break;
          }

          pushProcess(this.processForm.process_id, apiQuery)
            .then((res) => {
              if (res.code == 200) {
                this.msgSuccess("发起流程成功");
                this.detailOpen = false;
                this.newOpen = false;
                this.open = false;
                this.getList();
              }
            })
            .catch(() => {
              this.processForm.meetingRoom.startTime = "";
              this.processForm.meetingRoom.endTime = "";
              this.getMeetingUsedTime();
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    newCancel() {
      this.newOpen = false;
    },
    /** 查询流程定义列表 */
    getList() {
      this.loading = true;
      myProcessList(this.queryParams).then((response) => {
        this.myProcessList = response.data.records;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    resetProcessForm() {
      this.processForm.carApply = {
        carId: "",
        startTime: "",
        destination: "",
        attendees: "",
        purpose: "",
      };
      this.processForm.meetingRoom = {
        meetingRoomId: "",
        startTime: "",
        endTime: "",
        date: "",
      };
      this.attendees = [];
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
      this.handleQuery();
    },
    /** 搜索按钮操作 */
    handleProcessQuery() {
      this.queryProcessParams.pageNum = 1;
      this.listDefinition();
    },
    /** 重置按钮操作 */
    resetProcessQuery() {
      this.resetForm("queryProcessForm");
      this.handleProcessQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.open = true;
      this.title = "发起流程列表";
      this.listDefinition();
    },
    listDefinition() {
      listDefinition(this.queryProcessParams).then((response) => {
        this.definitionList = response.data.records;
        this.processTotal = response.data.total;
        this.processLoading = false;
      });
    },
    /**  发起流程按钮 */
    handleStartProcess(row) {
      this.resetProcessForm();
      this.newOpen = true;
      this.processForm.flowKey = row.flowKey;
      this.processForm.process_id = row.id;
      this.meetingUsedTimeFlag = false;
      // 人员名单
      attendeesList().then((res) => {
        let list = [];
        for (const index in res.data) {
          list.push({
            key: res.data[index].id,
            label: res.data[index].name,
          });
        }
        this.Userdata = list;
      });
    },
    /**  取消流程申请 */
    handleStop(row) {
      const params = {
        instanceId: row.procInsId,
      };
      stopProcess(params).then((res) => {
        this.msgSuccess(res.msg);
        this.getList();
      });
    },
    /** 流程流转记录 */
    handleFlowRecord(row) {
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
            break;
          case "carApply":
            this.detailForm.carApply.carId = res.data.carId;
            this.detailForm.carApply.startTime = res.data.startTime;
            this.detailForm.carApply.destination = res.data.destination;
            this.detailForm.carApply.purpose = res.data.purpose;
            this.detailForm.carApply.attendees = res.data.attendees;
          default:
            break;
        }
      });
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
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateDeployment(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDeployment(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.procInsId;
      this.$confirm("是否确认删除？ 删除后该流程将作废并且无法恢复。", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delRecord(ids);
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
<style lang="scss" scoped>
::v-deep.timeLabel {
  .el-form-item__content {
    margin-left: 30px !important;
  }
}
::v-deep.timeLabel2 {
  .el-form-item__content {
    margin-left: 10px !important;
  }
}
</style>