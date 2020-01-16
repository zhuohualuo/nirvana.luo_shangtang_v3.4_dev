<template>
  <div id="content">
    <!--查询/全局操作-->
    <el-row>
      <el-form :inline="true" class="_bottom0 demo-form-inline">
        <el-form-item>
          <el-button type="danger" size='small' @click="cancelAllPipeline" icon="el-icon-close">全部停止</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size='small' @click="getClickClId" >重试</el-button>
        </el-form-item>

      </el-form>
    </el-row>
    <!--表格-->
    <el-row>
      <el-table
              height="690" border class='_table' header-cell-class-name="_table-head"  ref="multipleTable"
              :data="pageList.programData" :row-key="getRowKey" :fit="true"
              :span-method="objectSpanMethod"
              :header-cell-style="cellStyle"
              style="width: 100%" @selection-change="handleSetSelectionChange" >
        <el-table-column show-overflow-tooltip prop="serial" width="190" label="序列号"></el-table-column>
        <el-table-column type="selection" prop="serial" :reserve-selection="true" :selectable="selectable"></el-table-column>
        <el-table-column show-overflow-tooltip prop="id" width="40" label="id"></el-table-column>
        <el-table-column type="index" width="90" label="序号" v-if="false"></el-table-column>
        <el-table-column show-overflow-tooltip prop="stage" width="190" label="stage名称"></el-table-column>
        <el-table-column show-overflow-tooltip prop="args"  label="运行参数"></el-table-column>
        <el-table-column show-overflow-tooltip prop="status" width="90" :formatter="getstatus"  label="运行状态"></el-table-column>
        <el-table-column show-overflow-tooltip prop="run_time" width="100" label="耗时"></el-table-column>
        <el-table-column label="更新时间" width="190">
          <template slot-scope='props'>{{dateFormat(props.row.updated_time)}}</template>
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="log_info"  label="日志文件"  v-if="false"></el-table-column>
        <table-operator :operateArray="operateArray" ></table-operator>
      </el-table>
    </el-row>

    <div class="block">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                     :page-sizes="[10, 15, 20, 50, 100]"
                     :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                     :total="pageList.count">
      </el-pagination>
    </div>

  </div>
</template>

<script>
  import {getPipelineLogList,cancelPipeline } from '@/api/ciPipeline';
  import TableOperator from "../../components/TableOperator/index"; //表格按钮
  import moment from 'moment' //引入moment化简时间
  import {getClId} from '@/api/ciPipeline';
  import Cookies from "js-cookie";
  var cache = []; //储蓄一条数据
  var cacheIndex = []; //位置
  var cacheData  = []
  var colData = [

    {
      prop:'serial',
      label:'序列号'
    },
    {
      prop:'id',
      label:'ID'
    },
    {
      prop:'stage',
      label:'步骤'
    },
    {
      prop:'args',
      label:'参数'
    },
    {
      prop:'status',
      label:'状态'
    },
    {
      prop:'run_time',
      label:'耗时'
    },
    {
      prop:'updated_time',
      label:'更新时间'
    },
    {
      prop:'log_info',
      label:'日志文件'
    },
    {
      prop:"rent_operation",
      label:"操作"
    }

  ]

  export default {
    name: "ciPipelineLog",
    components: {TableOperator},
    data() {
      return {
         operateArray: [
                    {label:'停止/跳过', type:"danger", click:this.cancelOnePipeline},
                    {label:'查看日志', click:this.gotoSeeLog},
                ],
        formLabelWidth: '120px',
        pageNums: 10,//每页几条
        pageNum: 1, //当前是第几页
        pageList: {
          page_no: 1,//页面开始页码
          page_size: 10,//每页条数
          count: 0,//总数目
          programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
        },
        pipeline_id: 0,
        colData:colData,
        choosedPlanList:[],
        clIdList:{
          editor:"",
          platform:"",
          pipeline_id:""
        },
        multi_id:[], //传入的参数数组
        itemList:[] //用于过渡的空数组
      };
    },
    mounted() {
      this.getParams();
      if(this.timer){
        clearInterval(this.timer);
      }else {
        this.timer=setInterval(()=> {
          this.initList();
        },10000)
      }
    },
    beforeRouteLeave (to, from, next) {
      // 导航离开该组件的对应路由时调用
      console.log('to',to.path)
      if(to.path === '/deviceManage/viewLog'){
        this.$store.dispatch('app/toggleChildNav', '/deviceManage/ciPipelineLog')
      }
      else{
        this.$store.dispatch('app/toggleParentNav')
      }
      next()
    },
    destroyed(){
      clearInterval(this.timer);
    },
    methods: {
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if(cacheData.length<=0){
          return false
        }
        let colNum = cacheData[rowIndex][columnIndex];
        if (colNum < 2) {
          return {
            rowspan: colNum,
            colspan: colNum
          }
        } else {
          return {
            rowspan: colNum,
            colspan: 1
          }
        }
      },
      combine(){
        this.pageList.programData.forEach((res,i)=> {
          cacheData[i] = [];
          colData.forEach((item, j) => {
            if (i === 0) {
              cacheData[0][j] = 1;
              cache = JSON.parse(JSON.stringify(res));
              cacheIndex[j] = 0;
            } else {
              if(res[item.prop] === cache[item.prop] && item.prop =='serial'){
                cacheData[cacheIndex[j]][j]++;
                cacheData[i][j] = 0
              }else{
                cache[item.prop] = res[item.prop];
                cacheIndex[j] = i;
                cacheData[i][j] = 1;
              }
            }
          })
        })
      },
      getParams() {
        // 取到路由带过来的参数
        console.log("this.$route.params.dataObj",this.$route.params.dataObj);
        var ref;
        if(this.$route.params.dataObj){
           ref=this.$route.params.dataObj
        }else{
          //取出
          ref=JSON.parse(window.sessionStorage.getItem('programArray'))
        }
        console.log("ref",ref);
        this.clIdList.pipeline_id=ref.id
        this.clIdList.editor=ref.editor
          if (ref.pipeline_id){
            this.pipeline_id = ref.pipeline_id
          }else{
            this.pipeline_id = ref.id;
          }

          this.initList()
      },
      cellMerge({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0) {
          const _row = this.spanArr[rowIndex];
          const _col = _row > 0 ? 1 : 0;
          return {
            rowspan: _row,
            colspan: _col
          }
        }
      },
      handleSizeChange(val) {
        this.pageNum = 1;
        this.pageNums = val;
        this.initList();
      },
      handleCurrentChange(val) {//改变页码
        this.pageNum = val;
        this.initList();
      },
      initList() {
        // 获取pipeline_id下数据
        let self = this;
        getPipelineLogList({
          page_no: self.pageNum,
          page_size: self.pageNums,
          pipeline_id: self.pipeline_id
        }).then(function(response) {
          self.pageList = {
            page_no: self.pageNum,
            page_size: 10 || self.pageNums,
            count: response.data.total,
            programData: response.data.ci_pipeline_log
          }
          self.combine();
        })
      },
        // 获取 clid
        getClickClId(){
          let self=this
          this.$confirm('此操作将会重试, 是否继续?', '是否重试', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
        getClId({
            "pipeline_id":self.clIdList.pipeline_id,
            "multi_id":self.multi_id,
            "editor":self.clIdList.editor,
            "platform":Cookies.get("platform")
          }).then(function(response){
            if(response.data.code==200){
              self.$message(response.data.msg);
            }else{
              self.$message(response.data.msg)
            }
          })
        })

        },
      getstatus(row, column){
        let status = row[column.property];
        if (status === 0) {
          return "未执行";
        } else if (status === 1) {
          return "执行中";
        } else if (status === 2) {
          return "执行完成";
        } else if (status === 3) {
          return "执行异常";
        } else if (status === 4) {
          return "停止";
        }else if (status === 5) {
          return "阻塞异常";
        }else if (status === 6) {
          return "全部停止";
        }
      },
      dateFormat(date) {
        if (date === undefined || date == null) {
          return "";
        }
        return moment(date).utcOffset(0).format("YYYY-MM-DD HH:mm:ss");
      },
      cancelAllPipeline(){ //取消全部任务
        let self = this
        this.$confirm('此操作将停止现在运行的全部任务, 请务必谨慎操作! 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          cancelPipeline({
            id: self.pipeline_id,
            type: 0,
            platform: Cookies.get("platform")
          }).then(function (response) {
            if (response.data.code === 200) {
              self.$message({
                type: 'success',
                message: '任务取消成功!'
              });
              self.initList();
            }
            else {
              self.$message({
                type: 'fail',
                message: '任务取消失败!请检查是否有任务在运行'
              });
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消停止全部任务'
          });
        });
      },
      cancelOnePipeline(self){ //取消子任务
        let ref =this
        cancelPipeline({
          id: this.pipeline_id,
          type: 1,
          platform: Cookies.get("platform")
        }).then(function (response) {
          if (response.data.code === 200) {
            ref.$message({
              type: 'success',
              message: '此任务取消/跳过成功!'
            });
            ref.initList();
          }
          else {
            ref.$message({
              type: 'fail',
              message: '此任务取消/跳过失败!'
            });
          }
        })
      },
      gobackCIPipeline(){
        this.$router.push({
          path: '/deviceManage/ciPipeline',
          name: '配置CI'
        })
      },
      gotoSeeLog(self){
        this.$router.push({
          path: '/deviceManage/viewLog',
          name: 'CI执行日志',
          params: {
            dataObj: self
          }
        })
      },
      //保存选中id
       handleSetSelectionChange(val){
          this.choosedPlanList = val;
          let len=val.length
          this.itemList=[]
          this.choosedPlanList.forEach(item=>{
            this.itemList.push(item.id)
          })
          this.multi_id=[...new Set(this.itemList)]
          console.log("this.multi_id",this.multi_id);

      },
      //优化table的渲染
      getRowKey (row) {
        return row.id
      },
      //不同序列号禁用
      selectable(row,index) {
        if(this.choosedPlanList.length===0){
          return true;
        }
        if(this.choosedPlanList.length>0){
          return this.choosedPlanList[0].serial===row.serial;
        }
      },
      //隐藏多选表头
      cellStyle({row, column, rowIndex, columnIndex}){
        // console.log("{row, column, rowIndex, columnIndex}",row, column, rowIndex, columnIndex);
        if(rowIndex==0&&columnIndex==1){
          return "text-indent:-9999px"
        }
      }
    }
  }
</script>

<style scoped>
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
</style>
