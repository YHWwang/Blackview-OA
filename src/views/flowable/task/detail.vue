<template>
  <div class="app-container">
    <el-dialog
      title="查看详情"
      :visible.sync="open"
      :before-close="detailCancel"
      append-to-body
    >
      <el-form ref="form" :model="form" label-width="80px">
        <el-tabs v-model="activeName" type="border-card">
          <el-tab-pane label="基本信息" name="first">
            <!-- 会议室流程 -->
            <div v-if="form.procDefKey === 'meetingRoom'">
              <el-card :body-style="{ padding: '10px' }">
                <el-descriptions
                  class="margin-top"
                  :column="1"
                  size="small"
                  border
                >
                  <el-descriptions-item
                    label-class-name="my-label"
                    content-class-name="my-content"
                  >
                    <template slot="label">会议室</template>
                    {{ formatMeetingRoom(form.meetingRoom.meetingRoomId) }}
                  </el-descriptions-item>
                  <el-descriptions-item
                    label-class-name="my-label"
                    content-class-name="my-content"
                  >
                    <template slot="label">会议主题</template>
                    {{ form.meetingRoom.topic }}
                  </el-descriptions-item>
                  <el-descriptions-item
                    label-class-name="my-label"
                    content-class-name="my-content"
                  >
                    <template slot="label">参与人员</template>
                    {{ form.meetingRoom.attendees }}
                  </el-descriptions-item>
                  <el-descriptions-item
                    label-class-name="my-label"
                    content-class-name="my-content"
                  >
                    <template slot="label">会议时间</template>
                    {{
                      form.meetingRoom.startTime +
                      " - " +
                      form.meetingRoom.endTime
                    }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-card>
            </div>
            <!-- 车辆流程 -->
            <div v-if="form.procDefKey === 'carApply'">
              <el-card :body-style="{ padding: '10px' }">
                <el-descriptions
                  class="margin-top"
                  :column="1"
                  size="small"
                  border
                >
                  <el-descriptions-item label-class-name="my-label">
                    <template slot="label">车辆信息</template>
                    {{ formatCarInfo(form.carApply.carId) }}
                  </el-descriptions-item>
                  <el-descriptions-item label-class-name="my-label">
                    <template slot="label">目的地</template>
                    {{ form.carApply.destination }}
                  </el-descriptions-item>
                  <el-descriptions-item label-class-name="my-label">
                    <template slot="label">车辆用途</template>
                    {{ form.carApply.purpose }}
                  </el-descriptions-item>
                  <el-descriptions-item label-class-name="my-label">
                    <template slot="label">同行人员</template>
                    {{ form.carApply.attendees }}
                  </el-descriptions-item>
                  <el-descriptions-item label-class-name="my-label">
                    <template slot="label">出发时间</template>
                    {{ form.carApply.startTime }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-card>
            </div>
          </el-tab-pane>
          <el-tab-pane
            label="审批记录"
            name="second"
            style="text-align: center"
          >
            <!--流程流转记录-->
            <el-card class="box-card" v-if="flowRecordList">
              <el-col :span="16" :offset="4">
                <div class="block">
                  <el-timeline>
                    <el-timeline-item
                      v-for="(item, index) in flowRecordList"
                      :key="index"
                      :icon="item.finishTime ? 'el-icon-check' : 'el-icon-time'"
                      :color="item.finishTime ? '#2bc418' : '#b3bdbb'"
                    >
                      <p style="font-weight: 700; text-align: left">
                        {{ item.taskName }}
                      </p>
                      <el-card :body-style="{ padding: '10px' }">
                        <el-descriptions
                          class="margin-top"
                          :column="1"
                          size="small"
                          border
                        >
                          <el-descriptions-item
                            v-if="item.assigneeName"
                            label-class-name="my-label"
                          >
                            <template slot="label"
                              ><i class="el-icon-user"></i>办理人</template
                            >
                            {{ item.assigneeName }}
                            <el-tag type="info" size="mini">{{
                              item.deptName
                            }}</el-tag>
                          </el-descriptions-item>
                          <el-descriptions-item
                            v-if="item.candidate"
                            label-class-name="my-label"
                          >
                            <template slot="label"
                              ><i class="el-icon-user"></i>候选办理</template
                            >
                            {{ item.candidate }}
                          </el-descriptions-item>
                          <el-descriptions-item label-class-name="my-label">
                            <template slot="label"
                              ><i class="el-icon-date"></i>接收时间</template
                            >
                            {{ item.createTime }}
                          </el-descriptions-item>
                          <el-descriptions-item
                            v-if="item.finishTime"
                            label-class-name="my-label"
                          >
                            <template slot="label"
                              ><i class="el-icon-date"></i>处理时间</template
                            >
                            {{ item.finishTime }}
                          </el-descriptions-item>
                          <el-descriptions-item
                            v-if="item.duration"
                            label-class-name="my-label"
                          >
                            <template slot="label"
                              ><i class="el-icon-time"></i>耗时</template
                            >
                            {{ item.duration }}
                          </el-descriptions-item>
                          <el-descriptions-item
                            v-if="item.comment"
                            label-class-name="my-label"
                          >
                            <template slot="label"
                              ><i class="el-icon-tickets"></i>审核结果</template
                            >
                            <el-tag
                              :type="
                                item.comment.type === '1' ? 'success' : 'danger'
                              "
                              >{{
                                item.comment.type === "1" ? "同意" : "拒绝"
                              }}</el-tag
                            >
                          </el-descriptions-item>
                          <el-descriptions-item
                            v-if="item.comment"
                            label-class-name="my-label"
                          >
                            <template slot="label"
                              ><i class="el-icon-tickets"></i>处理意见</template
                            >
                            {{ item.comment.comment }}
                          </el-descriptions-item>
                        </el-descriptions>
                      </el-card>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </el-col>
            </el-card>
          </el-tab-pane>
          <el-tab-pane label="流程图" name="third" style="text-align: center">
            <el-image style="max-width: 100%" :src="form.img"></el-image>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="status" type="primary" @click="auditBth"
          >审核</el-button
        >
        <el-button @click="detailCancel">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="审核流程"
      :visible.sync="auditOpen"
      width="600px"
      append-to-body
    >
      <el-form
        ref="auditForms"
        :rules="auditFormsRules"
        :model="auditForms"
        label-width="120px"
      >
        <el-form-item label="是否同意" prop="type">
          <el-radio-group v-model="auditForms.type">
            <el-radio :label="0">拒绝</el-radio>
            <el-radio :label="1">同意</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="意见" prop="message">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="请输入意见"
            v-model="auditForms.message"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="auditSubmitForm">确 定</el-button>
        <el-button @click="auditCancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from "@/utils/index";
import { flowRecord } from "@/api/flowable/task";
import { audit } from "@/api/flowable/todo";
export default {
  name: "Detail",
  props: {
    rows: {
      type: Object,
      required: true,
      default: {},
    },
    open: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: false,
    },
    auditForm: {},
    form: {
      required: true,
      type: Object,
      default: [],
    },
  },
  data() {
    return {
      activeName: "first",
      flowRecordList: [], // 流程流转数据
      meetingRoomIdOptions: [],
      auditOpen: false,
      auditForms: {},
      carIdOptions: [],
      auditFormsRules: {
        type: [{ required: true, message: "请选择同意/拒绝", trigger: "blur" }],
      },
    };
  },
  watch: {
    activeName(value) {
      if (value === "second") {
        //获取标签页中审核记录信息
        let id = this.form.img.slice(
          this.form.img.lastIndexOf("/") + 1,
          this.form.img.length
        );
        this.getFlowRecordList(id);
      }
    },
  },
  created() {
    this.init();
  },
  methods: {
    auditCancel() {
      this.auditOpen = false;
    },
    auditSubmitForm() {
      //提交审核信息
      this.$refs["auditForms"].validate((valid) => {
        if (valid) {
          this.auditOpen = true;
          audit(this.auditForms).then((res) => {
            this.msgSuccess("审核成功");
            this.auditOpen = false;
            this.detailCancel();
            this.$parent.getList();
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    auditBth() {
      this.auditOpen = true;
      this.auditForms = deepClone(this.auditForm);
    },
    init() {
      //初始化
      this.getDicts("sys_meeting_room").then((response) => {
        this.meetingRoomIdOptions = response.data;
      });
      this.getDicts("sys_car_info").then((response) => {
        this.carIdOptions = response.data;
      });
    },
    getFlowRecordList(id) {
      //获取审批记录信息
      flowRecord(id).then((res) => {
        this.flowRecordList = res.data.flowList;
      });
    },
    //格式化会议楼层字典
    formatMeetingRoom(id) {
      let val = "";
      this.meetingRoomIdOptions.forEach((item) => {
        if (item.dictValue == id) {
          val = item.dictLabel;
          return false;
        }
      });
      return val;
    },
    //格式化会议楼层字典
    formatCarInfo(id) {
      let val = "";
      this.carIdOptions.forEach((item) => {
        if (item.dictValue == id) {
          val = item.dictLabel;
          return false;
        }
      });
      return val;
    },
    detailCancel() {
      //弹窗取消按钮
      setTimeout(() => {
        this.activeName = "first"; //重置标签页
        this.$emit("showCloseDialog", false);
      }, 0);
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .my-label {
  width: 150px;
}

.text {
  font-size: 14px;
  line-height: 1;
}
.text .name {
  color: #1890ff;
  min-width: 85px;
  text-align: right;
}
.item {
  padding: 6px 0;
  display: flex;
  justify-content: flex-start;
}
.detail {
  white-space: pre-line;
}
::v-deep .el-tabs__content {
  min-height: 150px;
}
</style>