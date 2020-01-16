<template>
  <div class="advance-filter">
    <el-form :inline="true" class="_bottom0 demo-form-inline">
      <el-form-item v-for="(item,index) in filterFirst" :key="'first_'+index">
        <el-select v-if="item.type==='select'"
                   :placeholder="'请选择'+item.name"
                   v-model="formData[item.key]"
                   clearable filterable :key="item.key"
                   :disabled="handleDisable(item)"
                   @visible-change="(val)=>{val?handleVisible(item):''}"
                   @change="(val)=>{handleChange(val,item)}">
          <el-option v-for="(op,ind) in item.optionList" :label="op.label" :value="op.value" :key="'option1'+ind"></el-option>
        </el-select>
        <el-date-picker v-else-if="item.type==='date_picker'"
                      :value-format="item.format"
                      v-model="formData[item.key]"
                      type="datetimerange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期" >
        </el-date-picker>
        <el-input v-else :placeholder="'请输入'+item.name"
                  v-model.trim="formData[item.key]"
                  auto-complete="off" clearable
                  :disabled="handleDisable(item)"
                  @change="(val)=>{handleChange(val,item)}">
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="text" icon="el-icon-plus" v-if="needAdvance"
                   @click="openAdvance"
                   size="small"
                   style="color: #43988A;font-size: 13px">高级筛选</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size='small' circle @click="seachCondition" icon="el-icon-search" style="background-color: #43988A"></el-button>
      </el-form-item>
    </el-form>

    <el-dialog title="高级筛选" :visible.sync="advanceVisible" width="30%" :close-on-click-modal="false" @closed="closeAdvance">
      <div style="max-height: 500px;overflow: auto;">
        <el-form style="width:85%">
          <el-form-item v-for="(item,index) in filterSecond" :label="item.name" label-width="120px" :key="'second_'+index">
            <el-select v-if="item.type==='select'"
                       placeholder="请选择"
                       v-model="formData[item.key]"
                       style="width: 100%" clearable filterable
                       :disabled="handleDisable(item)"
                       @visible-change="(val)=>{val?handleVisible(item):''}"
                       @change="(val)=>{handleChange(val,item)}">
              <el-option v-for="(op,ind) in item.optionList" :label="op.label" :value="op.value" :key="'option2'+ind"></el-option>
            </el-select>
            <el-date-picker v-else-if="item.type==='date_picker'"
                      :value-format="item.format"
                      v-model="formData[item.key]"
                      type="datetimerange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期" >
            </el-date-picker>
            <el-input v-else placeholder="请输入"
                      v-model.trim="formData[item.key]"
                      auto-complete="off" clearable
                      :disabled="handleDisable(item)"
                      @change="(val)=>{handleChange(val,item)}">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="advanceVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveAdvance">保 存</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: "AdvanceFilter",
    data(){
      return {
        advanceVisible: false,
        needAdvance: false,
        filterChange: false,
        secondForm: ''
      }
    },
    computed: {
      filterFirst() {
        return this.filterArray.slice(0,this.showNumber)
      },
      filterSecond() {
        if(this.filterArray.length > this.showNumber){
          let tmp = this.filterArray.slice(this.showNumber);
          this.needAdvance = true;
          return tmp
        }
      },
    },
    mounted() {
    },
    props: {
      /** filterArray
       * {
       *  key: 筛选参数的key，必填
       *  name: 筛选参数展示的名称，必填
       *  type: 控件类型，必填，目前只区分select和input，后续视需要补充
       *  optionList: type为select时必填，对象数组，支持空数组
       *    {
       *      label: 选项显示名称，必填
       *      value: 选项绑定值，必填
       *    }
       *  disable: 可选，是否禁用该组件，支持 true/false/箭头函数/父组件方法，默认false
       *  visible: type为select时可选，展开下拉框时调用，一般用于获取数据填充optionList，传入父组件方法
       *  change: 可选，绑定值变化时调用，支持箭头函数和父组件方法
       *  }
       */
      filterArray: {
        type: Array,
        default() {
          return []
        }
      },
      formData: {
        type: Object,
        required: true,
        default() {
          return {}
        }
      },
      showNumber: {
        type: Number,
        default: 3
      },
      /** storeName
       *  组件销毁时可将筛选数据存sessionStorage，名称为storeName，可选，不传即不存
       */
      storeName: {
        type: String,
        default: ''
      }
    },
    beforeDestroy() {
      if(this.storeName){
        window.sessionStorage.setItem(this.storeName, JSON.stringify(this.formData))
      }
    },
    methods:{
      seachCondition(){
        this.$emit('search', this.formData)
      },
      openAdvance(){
        this.secondForm = JSON.parse(JSON.stringify(this.formData));
        this.advanceVisible = true;
      },
      saveAdvance(){
        this.filterChange = true;
        this.advanceVisible = false;
      },
      closeAdvance(){
        if(!this.filterChange){
          console.log('revert')
          for(var key in this.secondForm){
            this.formData[key] = this.secondForm[key]
          }
        }
        this.filterChange = false;
      },
      handleVisible(item){
        if(item.visible){
          item.visible.call(this.$parent, item)
        }
      },
      handleChange(val, item){
        if(item.change){
          item.change.call(this.$parent, val)
        }
      },
      handleDisable(item){
        if(item.disable){
          if(typeof item.disable === 'function')
          {
            return item.disable.call(this.$parent)
          }
          else{
            return item.disable
          }
        }
        return false
      }
    }
  }
</script>

<style scoped>
  .advance-filter {
    float: right;
  }
</style>