<template>
  <el-table-column label="操作" :width="width">
    <template slot-scope='props'>
      <el-row>
        <el-col v-for="(item, index) in firstArray" :span="needMore?6:8" :key="index">
          <el-dropdown @command='(val)=>{handleOutDropdown(item, val, props.row)}' placement="bottom" v-if="item.dropdown">
            <el-button type="text" :class="'_'+item.type" :disabled="handleDisable(item, props.row)">{{item.label}}</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="(drop, key) in item.dropList" :key="'outdrop'+key" :command="drop.command">{{drop.label}}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button v-else
                     type="text"
                     :class="'_'+item.type"
                     :disabled="handleDisable(item, props.row)"
                     @click="handleClick(item, props.row)">
            {{item.label}}
          </el-button>
        </el-col>
        <el-col v-if="needMore" :span="2" :offset="2">
          <el-dropdown @command='(val)=>{handleDropdown(val, props.row)}' placement="bottom">
            <el-button type="text" icon="el-icon-more"></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="(it, ind) in seconArray"
                                :command="ind"
                                :key="'drop'+ind"
                                :disabled="handleDisable(it, props.row)">
                {{it.label}}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
    </template>
  </el-table-column>
</template>

<script>
  export default {
    name: "TableOperator",
    computed: {
      allArray() {
        return this.operateArray.filter(function (item) {
          if(item.show === undefined){
            return true
          }
          else{
            return item.show
          }
        })
      },
      needMore() {
        return this.allArray.length > 3
      },
      firstArray() {
        return this.allArray.slice(0,3)
      },
      seconArray() {
        if(this.needMore){
          return this.allArray.slice(3);
        }
        else{
          return []
        }
      },
    },
    mounted() {
    },
    props: {
      /** operateArray
       * {
       *  label: 按钮显示文本，必填
       *  click: 按钮点击事件，必填，支持箭头函数和父组件方法
       *  type: 按钮类型，可选，包括primary（绿）/danger（红）/warning（黄）/info（黑）,默认primary  注：仅button生效，dropdown无效
       *  show: 按钮是否可见，可选，支持 true/false/表达式，默认true
       *  disable: 按钮是否禁用，可选，支持 true/false/箭头函数/父组件方法，默认false
       *  dropdown: 该按钮是否是下拉列表，默认为false，只支持true/false
       *  dropList: 下拉列表的选项，如dropdown为true，必填，对象列表：[{label: "显示文本"， command: "命令值"}]
       *  }
       */
      operateArray: {
        type: Array,
        default() {
          return []
        }
      },
      width: {
        type: Number,
        default: 250
      }
    },
    methods:{
      handleClick(item, row){
        if(item.click){
          item.click.call(this.$parent, row)
        }
      },
      handleDisable(item, row){
        if(item.disable){
          if(typeof item.disable === 'function')
          {
            return item.disable.call(this.$parent, row)
          }
          else{
            return item.disable
          }
        }
        return false
      },
      handleDropdown(val, row){
        let item = this.seconArray[val];
        this.handleClick(item, row)
      },
      handleOutDropdown(item, val, row){
        if(item.click){
            item.click.call(this.$parent, val, row)
        }
      }
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
  button {
    text-decoration:underline;
  }
</style>