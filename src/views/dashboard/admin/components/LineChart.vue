<template>
  <div class="line-chart-wrapper">
    <div class="line-chart-header">
      <div class="header-text">{{headers}}</div>
      <div class="header-extra">
        <el-cascader
                v-if="filterNew"
                v-model="filterNew.value"
                :options="filterNew.list"
                @change="cascaderChange"
                change-on-select size="mini"></el-cascader>
        <el-select v-model="selectNew.value" placeholder="测试集" filterable size="mini" @change="selectChange" @visible-change="visibleChange">
          <el-option v-for="(item,index) in selectNew.list" :label="item.title" :value="item.id" :key="index"></el-option>
        </el-select>
        <el-date-picker
                v-model="datePickerNew"
                :picker-options="pickerOptions0"
                unlink-panels
                type="daterange" size="mini"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd"
                @change="timeScopeChange">
        </el-date-picker>
      </div>
    </div>
    <div class="line-chart-data">
      <ve-line :data="lineChartData" :extend="extend" :settings="chartSettings"></ve-line>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    headers: {
      type: String,
      require: true
    },
    filter: {
      type: Object,
      default: undefined
    },
    select: {
      type: Object,
      require: true
    },
    datePicker: {
      type: Array,
      default:  function () {
          return []
      }
    },
    lineChartData: {
      type: Object,
      require: true
    }
  },
  data() {
    return {
      pickerOptions0: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          }
        }, 
        chartSettings: {
          labelMap: {
              'pass': '成功',
              'fail': '失败',
              'total': '总数',
          }
      },
      extend: {
        color: [ "#4acacb", "#fa6e86", "#5ab1ef"],
        series: {
          label: {
            normal: {
              show: true
            }
          }
        }
      },
      datePickerNew: this.datePicker,
      filterNew: this.filter,
      selectNew: this.select
    }
  },
  watch: {
      datePicker(val) {
          this.datePickerNew = val;
      },
      filter(val) {
          this.filterNew = val;
      },
      select(val) {
          this.selectNew = val;
      },
  },
  mounted() {

  },
  methods: {
    cascaderChange(val){
      this.$emit('cascaderChange', val)
    },
    selectChange(val){
      this.$emit('selectChange', val)
    },
    visibleChange(bool){
      this.$emit('visibleChange', bool)
    },
    timeScopeChange(val){
      this.$emit('timeScopeChange', val)
    },
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.line-chart-wrapper{
  margin: 0 32px 32px;
  .line-chart-header{
    height: 32px;
    .header-text{
      display: block;
      float: left;
      margin: 6px 0 0;
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 1px;
      color: #434343;
    }
    .header-extra{
      display: block;
      float: right;
    }
  }
  .line-chart-data{
    margin-top: 6px;
    background-color: rgba(254,248,239,0.65);
}
}
</style>