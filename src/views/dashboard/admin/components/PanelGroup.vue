<template>
  <el-card>
    <div slot="header" v-if="headers">
      <div class="card-header">
        <span class="card-header-text">{{headers}}</span>
        <count-to class="card-header-num" :startVal="0" :endVal="total" :duration="step"></count-to>
      </div>
    </div>
    <el-row class="panel-group" :gutter="20">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col" v-for="(item,index) in panelDataList" :key="index">
        <div class='card-panel' :class='"background-"+(index%3)' @click="handleSetLineChartData(item.id)">
          <div class="card-panel-text-wrapper">
            <span class="card-panel-text">{{item.project}}</span>
          </div>
          <div class="card-panel-num-wrapper">
            <count-to class="card-panel-num" :startVal="0" :endVal="item.count" :duration="step"></count-to>
          </div>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import CountTo from 'vue-count-to'

export default {
  components: {
    CountTo
  },
  props: {
      // route object
      headers: {
          type: String,
          default: ''
      },
      total: {
          type: Number,
          default: 1000
      },
      step: {
          type: Number,
          default: 1000
      },
      panelDataList: {
          type: Array,
          require: true
      }
  },
  methods: {
    handleSetLineChartData(id) {
      this.$emit('handleSetLineChartData', id)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.card-header{
  font-size: 24px;
  font-weight: bold;
  .card-header-text{
    color: #666;
  }
  .card-header-num{
    float: right;
    margin-right: 20px;
    color: #666;
  }
}
.panel-group {
  .card-panel-col{
    margin-bottom: 32px;
  }
  .background-0 {
    background-color: #4acacb;
    box-shadow: 0 5px 0 #42b5b6;
  }
  .background-1 {
    background-color: #6a8abe;
    box-shadow: 0 5px 0 #5f7cab;
  }
  .background-2 {
    background-color: #fc8675;
    box-shadow: 0 5px 0 #e27869;
  }
  .card-panel {
    height: 90px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    position: relative;
    overflow: hidden;
    border-color: rgba(0, 0, 0, .05);
    &:hover {
      box-shadow: 4px 4px 40px rgba(0, 0, 0, .45);
    }
    .card-panel-text-wrapper {
      float: left;
      width: 60%;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
      .card-panel-text {
        line-height: 20px;
        font-size: 20px;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 12px;
      }
    }
    .card-panel-num-wrapper {
      float: right;
      margin: 26px 26px 26px 0;
      .card-panel-num {
        color: rgba(0, 0, 0, 0.65);
        font-size: 24px;
      }
    }
  }
}
</style>
