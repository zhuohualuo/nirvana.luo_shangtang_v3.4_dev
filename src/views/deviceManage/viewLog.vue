<template>
  <div id="content">
  <el-row style="width:85%" >
    <el-form>
      <!--<el-form-item label="日志内容" :label-width="formLabelWidth">-->
        <el-input v-model="log_data" type="textarea" :rows="35" auto-complete="off" class="log-text-area"></el-input>
      <!--</el-form-item>-->
    </el-form>
  </el-row>

  </div>
</template>


<script scoped>
  import {viewPipelineLog} from '@/api/ciPipeline';
  var from_obj;
  export default {
    name: "viewLog",
    data() {
      return {
        formLabelWidth: '120px',
        log_file: '',
        log_data: '',
        pipeline_id: 0
      }
    },
    mounted() {
      this.getParams();
      if(this.timer){
        clearInterval(this.timer);
      }else {
        this.timer=setInterval(()=> {
          this.initList();
        },150000)
      }
    },
    updated(){
      this.$nextTick(()=>{
        var div=document.querySelector(".el-textarea__inner")
        div.scrollTop=div.scrollHeight
       })
    },
    beforeRouteLeave (to, from, next) {
      // 导航离开该组件的对应路由时调用
      console.log('to',to.path)
      if(to.path === '/deviceManage/ciPipelineLog'){
        this.$store.dispatch('app/toggleChildNav', '/deviceManage/ciPipeline')
      }
      else{
        this.$store.dispatch('app/toggleParentNav')
      }
      next()
    },
    destroyed(){
      clearInterval(this.timer);
    },
    beforeRouteEnter(to, from, next) {
      next(vm=>{          //  这里的vm指的就是vue实例，可以用来当做this使用
        from_obj = from
      })
    },
    methods: {
      getParams() {
        // 取到路由带过来的参数
        if (this.$route.params.dataObj) {
          this.log_file = this.$route.params.dataObj.log_info;
          this.initList()
        }
      },
      initList() {
        let self = this;
        viewPipelineLog({
          log_file: self.log_file
        }).then(function(response) {
          if (response.data.log_list.length>0){
            let log_list=response.data.log_list
            self.log_data = log_list.join('')
          }

        })

      },
      gobackCIPipelineLog(){
        let self = this
        this.$router.push({
          path: from_obj.path,
          name: from_obj.name,
          params: {
            dataObj: self.$route.params.dataObj
          }
        })
      },
    }
  }
</script>

<style >
  .block {
    float: right;
    margin-top: 15px;
  }

  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
  /*.el-textarea__inner*/

  .log-text-area .el-textarea__inner{
    background-color: #000;
    color: #d0d2d6;
    width: 119%;
  }
</style>
