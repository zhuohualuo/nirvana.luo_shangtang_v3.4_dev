<template>
  <div :class="className" :style="{height:height,width:width,top:top}"></div>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import { debounce } from '@/utils'

export default {
  props: {
    lineData:{
      type:Object,
      default:{}
    },
    className: {
      type: String,
      default: 'LineChart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '360px'
    },
    top: {
      type: String,
      default: '-30px'
    }
  },
  data() {
    return {
      chart: null,
      timeList:[],
      caseCount:[]
    }
  },
  watch:{
    lineData(val){
      this.timeList = [];
      this.caseCount = [];
      for(let it in val){
        this.timeList.push(it)
        this.caseCount.push(val[it])
      }
      this.initChart();
    }
  },
  mounted() {
    this.initChart()
    this.__resizeHanlder = debounce(() => {
      if (this.chart) {
        this.chart.resize()
      }
    }, 100)
    window.addEventListener('resize', this.__resizeHanlder)
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    window.removeEventListener('resize', this.__resizeHanlder)
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')

      this.chart.setOption({
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            boundaryGap: true,
            axisTick:{
              show:false,
            },
            axisLine:{
              show:false,
              lineStyle:{
                color:"#333",
              }
            },
            data: this.timeList
        },
        yAxis: {
            type: 'value',
            boundaryGap: false,
            axisTick:{
              show:false,
            },
            axisLine:{
              show:false,
              lineStyle:{
                color:"#333",
              }
            },
            splitLine:{
              show:true,     //去掉网格线
              lineStyle:{
                color:["#ccc"],
                type:'dashed',
              }
            },
        },
        series: [
        {
            name:'用例执行数',
            type:'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 5,
            sampling: 'average',
            itemStyle: {
                normal: {
                    color: '#43988A'
                }
            },
            stack: 'a',
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: '#43988A'
                    }, {
                        offset: 1,
                        color: '#FFF'
                    }])
                }
            },
            data: this.caseCount
        }
        ],
        
      })
    }
  }
}
</script>
