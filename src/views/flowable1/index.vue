<template>
  <div class="app-container">
    <el-button type="primary" @click="goBack">发起流程</el-button>
    <el-dialog title="标题" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入看看" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-input v-model="form.sex" placeholder="请输入看看" />
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
import {getNew} from '@/api/flowable/task'
export default {
  name: "New",
  components: {},
  data() {
    return {
      open:false,
      form: {
        name: "",
        sex: "",
      },
    };
  },
  created() {},
  methods: {
    goBack() {
      this.open = true
    },
    submitForm(){
      getNew(this.form).then( res=>{
        console.log(res);
      })
    },
    cancel(){
       this.open = false
    },
  },
};
</script>
