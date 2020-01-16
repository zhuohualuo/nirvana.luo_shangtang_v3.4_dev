<template>
  <div class="config-table">
    <div class="_left" style="margin-bottom: 5px">
      <el-button type="primary" size='small' @click="addParam" icon="el-icon-plus">新 增</el-button>
    </div>
    <el-table :data="tableData" :height="height" border class='_table' header-cell-class-name="_table-head">
      <el-table-column v-for="(item,index) in tableColumn" :key="index" show-overflow-tooltip :width="item.width?item.width:''">
        <template slot="header" slot-scope="scope">
          <span v-if="item.require" style="color: #F56C6C">* </span><span>{{item.label}}</span>
        </template>
        <template slot-scope='props'>
          <el-select v-if="item.type==='select'" v-model="props.row[item.key]"
                     filterable style="width: 100%"
                     @visible-change="(val)=>{val?handleVisible(item):''}">
            <el-option v-for="(op,ind) in item.optionList" :key="'op_'+ind"
                       :label="op.label" :value="op.value" :title="op.desc?op.desc:''"></el-option>
          </el-select>
          <el-input v-else-if="item.type==='input'" v-model="props.row[item.key]"></el-input>
          <span v-else>{{props.row[item.key]}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="90">
        <template slot-scope='props'>
          <el-button type="text" @click="removeParam(props.$index)" class="_danger op-btm">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import TableOperator from "../TableOperator/index";
  export default {
    name: "ConfigTable",
    components: {TableOperator},
    computed: {
    },
    mounted() {
    },
    props: {
      /** tableColumn
       * {
       *  label: 表格列名，必填
       *  key: 该列对应的key，用于获取数据，必填
       *  type: 该列组件类型，目前支持select/input/span，默认span即直接展示数据
       *  optionList: select的选项列表，type为select时必填，对象数组
       *    {
       *      label: 选项显示名称，必填
       *      value: 选项绑定值，必填
       *      desc: 选项描述，可选，以title显示
       *    }
       *  default: 新增参数时该列的默认值，可选
       *  visible: type为select时可选，展开下拉框时调用，一般用于获取数据填充optionList，传入父组件方法
       *  require: 该列是否必填，支持true/false，必填项在表头显示*
       *  width: 列宽，Number类型，可选
       *  }
       */
      tableColumn: {
        type: Array,
        required: true,
        default() {
          return []
        }
      },
      tableData: {
        type: Array,
        required: true,
        default() {
          return []
        }
      },
      height: {
        type: Number,
        default: 490
      },
      /**
       * position
       * 新增参数在表格首行或末行，begin——首行，end——末行，默认begin
       */
      position: {
        type: String,
        default: "begin"
      }
    },
    methods:{
      addParam(){
        let obj = {}
        for(let item of this.tableColumn){
          obj[item.key] = item.default===undefined?'':item.default
        }
        if(this.position==='end'){
          this.tableData.push(obj);
        }
        else{
          this.tableData.splice(0, 0, obj);
        }
      },
      removeParam(index){
        this.tableData.splice(index,1);
      },
      handleVisible(item){
        if(item.visible){
          item.visible.call(this.$parent, item)
        }
      },
    }
  }
</script>

<style scoped>
  ._primary:not(.is-disabled){
    color: #43988A
  }
  ._danger:not(.is-disabled){
    color: #F56C6C
  }
  ._warning:not(.is-disabled){
    color: #E6A23C
  }
  ._info:not(.is-disabled){
    color: #606266
  }
  .op-btm {
    text-decoration:underline;
  }
</style>