<template>
  <div id="content">
    <!--表格-->
    <el-row>
      <el-table
              height="690" border class='_table' header-cell-class-name="_table-head"
              :data="pageList.programData"
              style="width: 100%">
        <el-table-column show-overflow-tooltip prop="id" width="50" label="id"></el-table-column>
        <el-table-column show-overflow-tooltip prop="product" width="150" label="product"></el-table-column>
        <el-table-column type="index" width="190" label="序号" v-if="false"></el-table-column>
        <el-table-column show-overflow-tooltip prop="type" width="100" label="stage名称">
          <template slot-scope='props'>{{props.row.type==0?'重装系统':'部署系统'}}</template>
        </el-table-column>
        <el-table-column width="550"  label="运行参数">
          <template slot-scope='props'>{{props.row.args}}</template>
        </el-table-column>
        <el-table-column  :formatter="getstatus"  label="运行状态" width="100" prop="status"></el-table-column>
        <el-table-column show-overflow-tooltip prop="run_time" width="150" label="耗时"></el-table-column>
        <el-table-column label="创建时间" width="180">
          <template slot-scope='props'>{{dateFormat(props.row.created_time)}}</template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
          <template slot-scope='props'>{{dateFormat(props.row.updated_time)}}</template>
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="log_info"  label="日志文件"  v-if="false"></el-table-column>
        <el-table-column label="操作人" width="180">
          <template slot-scope='props'>
            <div class="table-text">{{props.row.operator}}</div>
          </template>
        </el-table-column>
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
  import {getSystemLog} from "@/api/device";
  import moment from 'moment' //引入moment化简时间
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
    }

  ]

  export default {
    name: "ciPipelineLog",
    data() {
      return {
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
        dev_id:"",
        platform_id:"",
        edit:""
      };
    },
    mounted() {
     this.pageList.programData=JSON.parse(window.sessionStorage.getItem("programDate"))
     this.pageList.total=JSON.parse(window.sessionStorage.getItem("count"))
      this.getParams();
      if(this.timer){
        clearInterval(this.timer);
      }else {
        this.timer=setInterval(()=> {
          this.initList();
        },10000)
      }
    },
    beforeDestroy() {
    this.$store.dispatch('app/toggleParentNav')
    },
    destroyed(){
      clearInterval(this.timer);
    },
    methods: {
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
        if (this.$route.params.dataObj) {
          if (this.$route.params.dataObj.id){
            this.dev_id = this.$route.params.dataObj.id
            this.platform_id=Cookies.get("platform")
            let params="?dev_id="+this.dev_id+"&platform_id="+this.platform_id+"&page_no="+this.page_no+"&page_size="+this.page_size
            let self=this
            getSystemLog(params).then(function(response){
                self.pageList.programData=response.data.deploy_record
                self.pageList.page_no=response.data.page_no
                self.pageList.total=response.data.total
                 //存入
                 window.sessionStorage.setItem("programDate",JSON.stringify(self.pageList.programData))
                 window.sessionStorage.setItem("count",JSON.stringify(self.pageList.total))
            })
          }else{
            this.pipeline_id = this.$route.params.dataObj.id;
          }

          this.initList()
        }
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
            //取出
            programData: JSON.parse(window.sessionStorage.getItem("programDate")),
            count: JSON.parse(window.sessionStorage.getItem("count"))
          }
          self.combine();
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
        }
      },
      dateFormat(date) {
        if (date === undefined || date == null) {
          return "";
        }
        return moment(date).utcOffset(0).format("YYYY-MM-DD HH:mm:ss");
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
