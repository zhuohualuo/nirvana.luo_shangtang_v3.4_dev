<template>
    <div class="body-contents">
        <el-row>
            <el-col :span="8" :offset="8">
                <el-upload
                        class="upload-demo"
                        drag
                        :action="getUploadPath()"
                        :headers="headers"
                        :data="{project_id:filter.project_id}"
                        :on-success='handleSuccess'
                        :before-upload="beforeUpload">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    <div class="el-upload__tip" slot="tip">
                        <span>仅支持单文件上传，仅支持xls/xlsx文件</span>
                        <el-button type="primary" icon="el-icon-download" size="mini" round style="margin-left: 55px" @click="getTemplate">模板下载</el-button>
                    </div>
                </el-upload>
            </el-col>
        </el-row>
        <div v-if="dialogVisible">
            <hr style="height: 1px;border: none;background-color: #E6E6E6;margin-top: 20px;"/>
            <span>上传结果：</span>
            <el-radio-group v-model="sheet" @change="switchRadio">
                <el-radio :label="index" v-for="(item, index) in resultList" :key="index">{{item.sheet}}</el-radio>
            </el-radio-group>
            <div v-if="total===0&&loading===false">
                <el-tag type="danger" style="font-size: 18px;margin-top:10px">Trace Log</el-tag>
                <div style="margin: 0 8%; font-size: 18px">{{msg}}</div>
            </div>
            <div v-else>
                <el-row style="margin-top: 15px">
                    <span class="span-info" style="font-weight: bold;">Total
                        <span style="font-size: 20px;margin-left: 2px">{{total}}</span>
                    </span>
                        <span class="span-success" style="margin-left: 20px;font-weight: bold;">Pass
                        <span style="font-size: 20px;margin-left: 2px">{{pass}}</span>
                    </span>
                        <span class="span-danger" style="margin-left: 20px;font-weight: bold;">Fail
                        <span style="font-size: 20px;margin-left: 2px">{{total-pass}}</span>
                    </span>
                </el-row>

                <el-table v-loading="loading" :data="cases"
                          height="420" border class='_table' header-cell-class-name="_table-head"
                          empty-text="没有失败数据">
                    <el-table-column prop="id" label="行数" width="60"></el-table-column>
                    <el-table-column show-overflow-tooltip prop="title" label="测试用例名称" width="500"></el-table-column>
                    <el-table-column show-overflow-tooltip prop="msg" label="提示" ></el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>
<script>
  import { getProjectList } from '@/api/project';
  import {  downloadCase} from '@/api/case';
  import Cookies from "js-cookie";
  const rootPath = process.env.BASE_API;

  export default {
    name:'uploadCase',
    data() {
      return {
        filter:{
            project_id: ''
        },
        total: 0,
        pass: 0,
        project_id: '',
        cases: [],
        resultList : [],
        sheet :0,
        msg:'',
        headers: {
          uidNumber: Cookies.get("uidNumber"),
          token: Cookies.get("token"),
          platform: Cookies.get("platform")
        },
        dialogVisible: false,
        logVisible: false,
        loading: false
      };
    },
    computed:{
    },

    mounted() {
        // 取到路由带过来的参数
        console.log("$route.params.filter",this.$route.params.filter)
        if(this.$route.params.filter){
            this.filter = this.$route.params.filter;
        }
    },
    methods: {
      resetData(){
        this.total = 0;
        this.pass = 0;
        this.project_id = ''
        this.resultList =[];
        this.msg = '';
        this.dialogVisible = true;
        this.loading = true;
        this.logVisible = false;
      },
      switchRadio(){
        this.total = 0;
        this.pass = 0;
        this.cases=[];
        this.msg = '';
        if(this.resultList[this.sheet].total==0){
          this.msg = this.resultList[this.sheet].msg;
        }else {
          this.pass = this.resultList[this.sheet].pass;
          this.cases = this.resultList[this.sheet].cases;
          this.total = this.resultList[this.sheet].total;
        }
      },

      getUploadPath(){
        return rootPath + '/auto/case/upload';
      },

      handleRemove(file, fileList) {
      },

      handlePreview(file) {
      },

      beforeUpload(file){
        let tmp = file.name.split(".");
        let type = tmp[tmp.length-1];
        const isXls = type === 'xls';
        const isXlsx = type === 'xlsx';
        if( isXls || isXlsx){
          this.resetData()
          return true
        }
        else{
          this.$message.error('仅支持xls/xlsx文件!');
          return false
        }
      },

      handleSuccess(response, file, fileList) {
        console.log(response)
        this.resultList = response.resultList;
        this.msg = response.msg ;
        this.project_id = response.project_id;
        if ( this.resultList.length ==0){
          this.$message.error("Unknown error")
        }else {
          this.sheet = 0;
          if(this.resultList[0].total==0){
            this.msg = this.resultList[0].msg;
          }else {
            this.pass = this.resultList[0].pass;
            this.cases = this.resultList[0].cases;
            this.total = this.resultList[0].total;
          }
        }
        this.loading = false;
      },

      getTemplate(){
        let self = this;
        downloadCase({}).then(function (response) {
          if(response.data.code === 0){
            window.location.href = rootPath + '/common/report/download/' + response.data.path;
          }
          else{
            self.$message.error(response.data.msg)
          }
        }).catch(function (err) {
        });
      },
      goToList(){
        this.$router.push({
          path: '/autoTest/caseManage/' + this.filter.project_id,
          query:{
              project_id: this.filter.project_id
          },
          params:{
            filter: this.filter
          }
        })
      },
    },
    beforeDestroy() {
      this.$store.dispatch('app/toggleParentNav')
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    ._upload{
        margin: 10px 0;
        font-size: 16px;
        .el-tag{
            margin: 10px;
            font-size: 14px;
        }
    }

</style>
<style>
.body-contents .el-card.is-always-shadow{
  box-shadow: 0 0 0 ;
}
.body-contents .el-card{
  border: 0;
}
.body-contents .el-card__body{
  margin-left: 30%;
}
</style>

