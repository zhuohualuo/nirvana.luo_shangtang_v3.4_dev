<template>
  <div class="dashboard-editor-container">
    <div class="box">
      <div class="box-left">
        <div class="time">
          <div class="time-span">
            <span class="time-title">测试报告（份）</span>
          </div>
          <div class='time-choose'>
            <span @click="timeChoose({label:'近一周',value:{week:true},flag:'report'})" :style="{'color':currentChooseTime.label == '近一周'?'#43988A':''}">近一周</span><span style="margin:0 8px;color:#C2C2C2">|</span>
            <span @click="timeChoose({label:'近一月',value:{month:true},flag:'report'})" :style="{'color':currentChooseTime.label == '近一月'?'#43988A':''}">近一月</span><span style="margin:0 8px;color:#C2C2C2">|</span>
            <el-popover placement="bottom" width="440" trigger="hover">
              <el-date-picker v-model="datePickerTime" @change="dataChange" unlink-panels :default-value="timeDefaultShow" :picker-options="pickerOptions" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" style="width:100%"></el-date-picker>
              <span slot="reference" :style="{'color':currentChooseTime.label == '自定义'?'#43988A':''}" style="margin-right:16px">自定义</span>
            </el-popover>
          </div>
        </div>
        <div>
            <span class="time-sum">{{total | toThousandslsFilter}}</span>
          </div>
        <div class="quan">
          <PieVChart :picData='picData' :reportColorList='reportColorList'/>
        </div>
        <div class="list">
          <div v-for="(item,index) in listData" :key='index' class="list-div">
            <span :style="{backgroundColor:colorList[item.name].color}" class="list-div-color"></span>
            <span  class="list-div-name">{{colorList[item.name].label}}</span>
            <span  class="list-div-percent">{{item.rate}}</span>
            <span  class="list-div-num">{{item.count}}</span>
          </div>
        </div>
      </div>
      <div class="box-right">
        <div class="top">
          <div class="top-title">
            <div class="top-title-case">用例执行（次）</div>
            <div class="top-title-time">
              <span @click="timeChoose({label:'近一周',value:{week:true},flag:'case'})" :style="{'color':currentCaseTime.label == '近一周'?'#43988A':''}">近一周</span><span style="margin:0 8px;color:#C2C2C2">|</span>
              <span @click="timeChoose({label:'近一月',value:{month:true},flag:'case'})" :style="{'color':currentCaseTime.label == '近一月'?'#43988A':''}">近一月</span><span style="margin:0 8px;color:#C2C2C2">|</span>
              <el-popover placement="bottom" width="440" trigger="hover">
                <el-date-picker v-model="dateCasePickerTime" @change="dataCaseChange" :picker-options="pickerOptions" :default-value="timeDefaultShow" unlink-panels type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" style="width:100%"></el-date-picker>
                <span slot="reference" :style="{'color':currentCaseTime.label == '自定义'?'#43988A':''}" style="margin-right:16px">自定义</span>
            </el-popover>
            </div>
          </div>
          <div class="top-lineChart">
            <LineVChart :lineData='case_count'/>
          </div>
        </div>
        <div class="bottom">
          <div class="bottom-title">
            <div class="bottom-title-name">用例总数</div>
            <div class="bottom-title-num">{{caseTotal | toThousandslsFilter}}</div>
          </div>
          <div :class="isOverFive>5?'bottom-overF':''">
              <div :class="isOverFive>5?'bottom-five':'bottom-pic'" :style="{width:isOverFive>5?240*isOverFive+'px':''}">
                <div  v-for="(item,index) in caseList" :key="index" :class="isOverFive>5?'bottom-pic-five':'bottom-pic-box'">
                  <div class="bottom-pic-box-caseNum">{{item.count}}</div>
                  <div class="bottom-pic-box-caseName">{{item.project}}</div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import PieVChart from './components/PieVChart';
import LineVChart from './components/LineVChart';
import { getApiCaseCount, getPerfCaseCount, getPrecisionCaseCount, getStatisticsReport, getStatisticsCase } from '@/api/statistics';
export default {
  name: 'dashboard-admin',
  components: {
    PieVChart,
    LineVChart,
  },
  data() {
    return {
      timeDefaultShow:'',
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      }, 
      reportColorList:[],
      case_count:{},
      datePickerTime:'',
      dateCasePickerTime:'',
      currentChooseTime:{label:'近一周',value:{week:true}},
      currentCaseTime:{label:'近一周',value:{week:true}},
      picData:[],
      total:'',
      caseTotal:'',
      caseList:[],
      isOverFive:0,
      colorList:{
        'api':{'color':'#51B8A7','label':'功能测试'},
        'performance':{'color':'#6AD1E0','label':'性能测试'},
        'precision':{'color':'#F8AB4B','label':'算法评测'},
        'ui':{'color':'#FF9696','label':'UI测试'},
        'ci':{'color':'#7289AB','label':'持续集成'},
      },
      listData:[],
    }
  },
  mounted(){
    this.timeDefaultShow = new Date();
    this.timeDefaultShow.setMonth(new Date().getMonth() - 1);
    this.getStatisticsReport();//拉取测试报告
    this.caseNum();//拉取用例执行次数
    this.countApi().then(e=>{
      this.countOther();
    })//用例总数
  },
  methods: {
    timeChoose(time){
      if(time.flag == 'report'){
        if(this.currentChooseTime.label == time.label) return false
        this.currentChooseTime.label = time.label;
        this.currentChooseTime.value = time.value;
        this.getStatisticsReport();
      }else{
        if(this.currentCaseTime.label == time.label) return false
        this.currentCaseTime.label = time.label;
        this.currentCaseTime.value = time.value;
        this.caseNum();
      }
    },
    timeValidate(e){
      var start = new Date(e[0].replace(/-/g,"/")).getTime();
      var end = new Date(e[1].replace(/-/g,"/")).getTime();
      return end-start>3*30*24*60*60*1000
    },
    dataCaseChange(){
      if(this.dateCasePickerTime&&this.dateCasePickerTime.length>1){
          if(this.timeValidate(this.dateCasePickerTime)) return this.$message.error('时间跨度不能超过3个月!')
          this.currentCaseTime = {label:'自定义',value:{start_time:this.dateCasePickerTime[0],end_time:this.dateCasePickerTime[1]}}
          this.caseNum()
      }
    },
    dataChange(){
      if(this.datePickerTime&&this.datePickerTime.length>1){
          if(this.timeValidate(this.datePickerTime)) return this.$message.error('时间跨度不能超过3个月!')
          this.currentChooseTime = {label:'自定义',value:{start_time:this.datePickerTime[0],end_time:this.datePickerTime[1]}}
          this.getStatisticsReport()
      }
    },
    caseNum(){
      getStatisticsCase(this.currentCaseTime.value).then(e=>{
        if(e.data.code == 0){
          this.case_count = e.data.case_count;
        }else{
          this.$message.error(e.data.msg)
        }
      })
    },
    async countApi(){
      let self = this;
      await getApiCaseCount().then(function(response) {
        if(response.data.code === 0){
          self.caseTotal = response.data.total;
          self.caseList = response.data.caseCount;
          self.isOverFive = response.data.caseCount.length
        }
        else{
          self.$message.error(response.data.msg);
        }
      })
    },
    async countOther(){
      let self = this;
      //获取性能case数
      let perf = await getPerfCaseCount();
      if(perf && perf.data.code === 0){
        self.countWheel(perf.data.caseCount);
      }
      else{
        self.$message.error(perf.data.msg);
      }
      //获取准确率case数
      let precision = await getPrecisionCaseCount();
      if(precision && precision.data.code === 0){
        self.countWheel(precision.data.caseCount);
      }
      else{
        self.$message.error(precision.data.msg);
      }
    },
    countWheel(data){
      let sum = 0;
      for(let item of this.caseList){
        if(data[item.id]){
          item.count += data[item.id];
          sum += data[item.id];
        }
      }
      this.caseTotal += sum;
    },
    getStatisticsReport(){
      this.picData = [];
      getStatisticsReport(this.currentChooseTime.value).then(e=>{
        if(e.data.code == 0){
          this.total = e.data.total;
          this.listData = e.data.report_count;
          this.listData.map(item=>{
            this.picData.push({
              value:item.count,
              name:this.colorList[item.name].label
            })
          this.reportColorList.push(this.colorList[item.name].color)
          })
        }else{
          this.$message.error(e.data.msg)
        }
      })
    },
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-editor-container {
  height: 100%;
  .box{
    height: 100%;
    display: flex;
    justify-content: space-around;
    overflow: hidden;
    &-left{
      width:33%;
      background-color: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      .time{
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        overflow: hidden;
        height: 11%;
        padding-left: 7%;
        &-title{
          margin-bottom: 19px;
          font-size:18px;
          font-family:SourceHanSansCN;
          font-weight:500;
          color:rgba(102,102,102,1);
        }
        &-sum{
          font-size:30px;
          font-family:DINAlternate;
          font-weight:bold;
          color:rgba(51,51,51,1);
        }
        &-choose{
          span{
            color:rgba(153,153,144,1);
            cursor: pointer;
          }
        }
      }
      .quan{
        width:100%;
      }
      .list{
        width: 100%;
        padding: 3% 12% 0 19%;
        &-div{
          height: 32%;
          line-height: 37px;
          border-bottom: 1px solid #f2f2f2;
          span{
            display: inline-block;
          }
          &-color{
            background-color: rgb(208, 16, 76);
            width: 5%;
            height: 44%;
            vertical-align: middle;
            margin-right: 4%;
          }
          &-name{
            width: 33%;
            color:rgba(102,102,102,1);
            font-family:SourceHanSansCN;
          }
          &-percent{
            width: 15%;
            text-align: end;
          }
          &-num{
            width: 35%;
            text-align: end;
          }
        }
      }
    }
    &-right{
      width:66%;
      height:100%;
      .top{
        background-color:#ffffff;
        &-title{
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 35px;
          line-height: 84px;
          &-case{
            font-size:18px;
            font-family:SourceHanSansCN;
            font-weight:500;
            color:rgba(102,102,102,1);
          }
          &-time span{
            color:rgba(153,153,144,1);
            cursor: pointer;
          }
        }
      }
      .bottom{
        margin-top:1%;
        padding: 0 20px;
        box-sizing: border-box;
        background-color:#ffffff;
        &-title{
          line-height: 84px;
          display: flex;
          &-name{
            font-size:18px;
            margin-left:20px;
            font-family:SourceHanSansCN;
            font-weight:500;
            color:rgba(102,102,102,1);
          }
          &-num{
            font-size:24px;
            margin-left: 20px;
            font-family:DINAlternate;
            font-weight:bold;
            color:rgba(51,51,51,1);
          }
        }
        &-overF{
          width: 100%;
          height: 240px;
          overflow: auto;
        }
        &-pic{
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 225px;
          &-five{
            width: 200px;
            float: left;
            height: 180px;
            margin: 20px;
            margin-top: 5px;
            background-color: #DCF5F0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            &-caseNum{
              font-size:37px;
              font-family:DINAlternate;
              font-weight:bold;
              color:rgba(67,152,138,1);
              margin-bottom:29px;
            }
            &-name{
              font-size:16px;
              font-family:SourceHanSansCN;
              font-weight:400;
              color:rgba(51,51,51,1);
            }
          }
          &-box{
            flex:1;
            margin: 20px;
            margin-top: 5px;
            height: 200px;
            background-color: #DCF5F0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            &-caseNum{
              font-size:37px;
              font-family:DINAlternate;
              font-weight:bold;
              color:rgba(67,152,138,1);
              margin-bottom:29px;
            }
            &-name{
              font-size:16px;
              font-family:SourceHanSansCN;
              font-weight:400;
              color:rgba(51,51,51,1);
            }
          }
        }
      }
    }
  }
}
</style>
