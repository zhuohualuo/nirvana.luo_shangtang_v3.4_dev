<template>
    <div id="content">
        <el-row>
            <div class="_left">
                <template v-if="recycle.recycleView==false">
                    <el-button type="primary" size='small' @click="addSuite" icon="el-icon-plus">新 增</el-button>
                    <el-button type="danger" size='small' @click="batchRecycle(0)">批量删除</el-button>
                </template>
                <template v-if="recycle.recycleView==true"> 
                    <el-button type="danger" size='small' @click="batchDelete(1)">彻底删除</el-button>
                    <el-button type="success" size='small' @click="batchRestore(1)">批量还原</el-button>
                </template>
                <template>
                    <el-button type="warning" size="small" @click="showDeleteSuite(true)" v-if="recycle.recycleView==false">进入回收站</el-button>
                    <el-button type="warning" size="small" @click="showDeleteSuite(false)" v-else>返回测试集</el-button>
                </template>
                <template v-if="recycle.recycleView==false">
                    <el-checkbox v-model="filter.viewMySuite" border size="small" @change="viewMySuite">只看我的</el-checkbox>
                </template>
            </div>
            <advance-filter :formData="filter" :filterArray="filterArray" @search="seachCondition" :showNumber="2"></advance-filter>
        </el-row>
        <el-row>
            <el-table  v-loading="tableLoading" :data="pageList.programData" height="680" border class='_table' header-cell-class-name="_table-head" @selection-change="handleSelectionChange" @sort-change="handSortChange">
                <el-table-column type="selection"></el-table-column>
                <el-table-column type="index" width="55" label="序号"></el-table-column>
                <el-table-column prop="data.name" label="测试集名称"></el-table-column>
                <el-table-column show-overflow-tooltip prop="product" label="项目" width="120">
                    <template slot-scope="scope">
                        {{projectFormat(scope.row.data.product)}}
                    </template>
                </el-table-column>
                <el-table-column label="测试用例" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span>{{getRowCase(scope.row.data.case)}}</span>
                    </template>
                </el-table-column>
                <el-table-column sortable="custom" show-overflow-tooltip prop="create_time" width="170" label="创建时间"></el-table-column>
                <el-table-column sortable="custom" show-overflow-tooltip prop="operator" width="150" label="创建人"></el-table-column>
                <table-operator v-if="recycle.recycleView===false" :operateArray="operateArray"></table-operator>
                <table-operator v-else :operateArray="operateArray2"></table-operator>
            </el-table>
        </el-row>
        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[20, 30, 50, 100, 150]"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                           :total="pageList.count">
            </el-pagination>
        </div>

        <el-dialog title="确认执行测试集" :visible.sync="dialogFormVisible">
            <div style="max-height: 500px;overflow: auto;">
                <el-form class="demo-form-inline" style="width:90%">
                    <!-- <el-form :inline="true">
                        <el-form-item label="是否启用" :label-width="formLabelWidth">
                            <el-select v-model="enable" size="small">
                                <el-option label="启用" :value="true"></el-option>
                                <el-option label="不启用" :value="false"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form> -->
                    <el-tag class="_configTitle">公共参数</el-tag>
                    <el-form-item label="执行方式" :label-width="formLabelWidth" style="block:right">
                        <el-select v-model="serial" size="small">
                            <el-option label="串行" :value="true"></el-option>
                            <el-option label="并行" :value="false"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="item.key" v-for="(item,index) in currentRowPoint" :key="index" :label-width="formLabelWidth">
                        <el-input v-model="item.value"></el-input>
                    </el-form-item>
                    <el-tag class="_configTitle">邮件发送至(请填写完整邮件地址，以英文逗号分隔)</el-tag>
                    <el-form-item label="邮件发送至" :label-width="formLabelWidth">
                        <el-input v-model="to_mail" title="请输入收件人邮箱地址，以英文逗号分隔" ></el-input>
                    </el-form-item>
                    <el-form-item label="抄送至" :label-width="formLabelWidth" >
                        <el-input v-model="cc_mail" title="请输入抄送人邮箱地址，以英文逗号分隔" ></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <div slot="footer" class="dialog-footer">
                <div>
                    <el-button @click="dialogFormVisible = false">取 消</el-button>
                    <el-button type="primary" @click="confirmRunSuite">确 定</el-button>
                </div>
            </div>
        </el-dialog>
        <el-dialog title="克隆测试集" :visible.sync="cloneVisible" width="40%">
          <el-input v-model.trim="form.name">
            <span slot="prepend">新测试集名称</span>
          </el-input>
          <div slot="footer" class="dialog-footer">
            <el-button @click="cloneVisible = false">取 消</el-button>
            <el-button type="primary" @click="submitClone">确 定</el-button>
          </div>
        </el-dialog>

    </div>
</template>

<script>
    import AdvanceFilter from "../../components/AdvanceFilter/index";
    import TableOperator from "../../components/TableOperator/index";
    import { FilterProject, FilterVersion, FilterModule } from '@/common/index';
    import { getProjectList, getVersionList } from '@/api/project';
    import { createNewTask, getSuiteList, deleteSuite, cloneSuite,restoreSuite } from '@/api/precision';

    export default {
        name:'suiteList',
        components: {AdvanceFilter, TableOperator},
        data(){
            return {
                to_mail:'',
                cc_mail:'',
                form:{
                    id: '',
                    name: ''
                },
                filter:{
                    name: '',
                    operator : '',
                    time :'',
                    sort:'',
                    order:'',
                    case:'',
                    viewMySuite:false,
                },
                projectList: [],
                pageNums: 20,   //每页几条
                pageNum: 1,     //当前是第几页
                pageList: {
                    page_no: 1,     //页面开始页码
                    page_size: 20,      //每页条数
                    count: 0,   //总数目
                    programData: []     //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                serial: true,
                enable:true,
                product:'',
                name: '',
                currentData:{},
                currentRowPoint: [],
                cloneVisible: false,
                multipleSelection: [],
                formLabelWidth: '120px',
                dialogFormVisible: false,
                tableLoading :false,
                recycle:{
                    recycleView:false,
                    recycleButton:true,
                    active:"1",
                },
                filterArray: [
                    {key:'name',name:'测试集名称',type:'input'},
                    {key:'case',name:'测试用例名称',type:'input'},
                    {key:'operator',name:'操作人',type:'input'},
                    {key:'time',name:"创建时间",type:'date_picker',format:"yyyy-MM-dd HH:mm:ss"},
                ],
                operateArray: [
                    {label:'执行',type:"primary",click:this.runSuite},
                    {label:'编辑', click:this.updateSelf1},
                    {label:'克隆', click:this.cloneSelf1},
                    {label:'删除', type:"danger", click:this.batchRecycle},
                ],
                operateArray2: [
                    {label:'彻底删除', type:"danger", click:this.batchDelete},
                    {label:'还原', type:"success", click:this.batchRestore},
                ],
            }
        },
        mounted(){
            this.getListByPage();
            this.getProduct();
        },
        methods:{
            addSuite(){
                this.$router.push({
                    path: 'precision/createSuite',
                    name: 'createSuite',
                });
                this.$store.dispatch('app/toggleChildNav', '/precision/suiteList');
            },
            getListByPage(){
                let self = this;
                self.tableLoading = true;
                let params ={
                    page_no: self.pageNum,
                    page_size: self.pageNums,
                    name: self.filter.name,
                    operator : self.filter.operator,
                    time :self.filter.time,
                    sort : self.filter.sort,
                    order : self.filter.order,
                    case : self.filter.case,
                    active:self.recycle.active,
                };
                if(this.filter.viewMySuite){
                    params['operator']=this.$store.getters.name;
                }
                getSuiteList(params).then(function (response) {
                    if(response.data.code === 0){
                        self.pageList = {
                            page_no: self.pageNum,
                            page_size: 20 || self.pageNums,
                            count: response.data.total,
                            programData: response.data.suites
                        }
                        self.tableLoading = false;
                    }
                    else{
                        self.pageList.programData = [];
                        self.tableLoading = false;
                    }
                })
            },
            getProduct(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            runSuite(self){
                this.to_mail = self.mail.to_mail.join(',');
                this.cc_mail = self.mail.cc_mail.join(',');
                this.name = self.data.name;
                this.product = self.data.product;
                this.currentData = self.data;
                this.currentRowPoint = self.data.config;
                this.dialogFormVisible = true;
            },
            confirmRunSuite(){
                let mail = {to_mail:[],cc_mail:[]};
                mail.to_mail = (this.to_mail=== "") ? [] : this.to_mail.split(',');
                mail.cc_mail = (this.cc_mail=== "") ? [] : this.cc_mail.split(',');
                let self = this;
                // 入参
                let obj = {
                    serial:this.serial,
                    enable:this.enable,
                    product:this.product,
                    name:this.name,
                    description:this.currentData.description,
                    config:this.currentRowPoint,
                    setup:this.currentData.setup,
                    suite:this.currentData.suite,
                    case:this.currentData.case,
                }
                createNewTask({
                   data:obj,mail:mail
                }).then(function (response) {
                    if(response.data.code === 0){
                        self.dialogFormVisible = false;
                        self.$message.success("测试集执行成功，请在任务中心查看运行情况！");
                    }
                    else{
                        self.$message.error(response.data.msg);
                    }
                })
            },
            updateSelf1(self){
                this.$router.push({
                    path: 'precision/updateSuite',
                    name: 'updateSuite',
                    params: {
                        dataObj: self,
                    }
                });
                this.$store.dispatch('app/toggleChildNav', '/precision/suiteList');
            },
            cloneSelf1(self) {
              this.form = {
                id: self.id,
                name: ''
              }
              this.cloneVisible = true;
            },
            batchRecycle(self){
                let ref = this;
                let ids =[];
                if(self===0){
                    if(this.multipleSelection.length < 1){
                        return this.$notify.error("请至少选择一个测试集！");
                    }
                    ids = this.getIdFromList(this.multipleSelection);
                }else{
                    ids=[self.id];
                }

                this.$confirm('此操作将加入回收站, 是否继续?', '回收', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteSuite({id : ids,delete:"0"}).then(function (response) {
                        if(response.data.code === 0){
                            ref.$message.success("回收成功！")
                            ref.getListByPage();
                        }
                        else{
                            ref.$message.error(response.data.msg);
                        }
                    })
                }).catch(function (err) {
                });
            },
            seachCondition(){
                this.pageNum = 1;
                this.getListByPage();
            },
            submitClone(){
                if(this.form.name === ''){
                    this.$notify.error("测试集名称不可以为空！");
                        return false;
                    }
                let ref = this;
                cloneSuite({
                    id: ref.form.id,
                    name: ref.form.name,
                }).then(function (response) {
                    if(response.data.code === 0){
                        ref.$message.success("克隆成功！");
                        ref.cloneVisible = false;
                        ref.getListByPage();
                    }
                    else{
                        ref.$message.error(response.data.msg);
                    }
                })
            },
            projectFormat(row) {
                var project = row;
                if ((project == undefined) || (this.projectList.length == 0)) {
                    return "";
                }
                let tmp = this.projectList.filter(function(item){
                    return item.id == project;
                })
                if(tmp.length > 0){
                    return tmp[0].name
                }
            },
            getRowCase(cases){
                if(cases){
                    let arr = [];
                    for(let key in cases){
                        arr.push(cases[key].name)
                    }
                    return arr.join('， ')
                }
                return ''
            },
            handleSizeChange(val) {
                this.pageNum = 1;
                this.pageNums = val;
                this.getListByPage();
            },
            handleCurrentChange(val) {
                this.pageNum = val;
                this.getListByPage();
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            handSortChange(column,prop,order){
                if(column.column!=null){
                    let sort='-1';
                    if(column.order==="descending"){
                        sort = '-1';
                    }
                    if(column.order==="ascending"){
                        sort = '1';
                    }
                    this.filter.order=column.prop;
                    this.filter.sort=sort;
                }
                this.getListByPage();
            },
            getIdFromList(list){
                let tmp = [];
                list.forEach(function(item){
                    tmp.push(item.id)
                })
                return tmp;
            },
            batchDelete(self){
                let ref = this;
                let ids =[];
                if(self===1){
                    if(this.multipleSelection.length < 1){
                        return this.$notify.error("请至少选择一个测试集！");
                    }
                    ids = this.getIdFromList(this.multipleSelection);
                }else{
                    ids=[self.id];
                }
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteSuite({id : ids,delete:"1"}).then(function (response) {
                        if(response.data.code === 0){
                            ref.$message.success("删除成功！")
                            ref.getListByPage();
                        }
                        else{
                            ref.$message.error(response.data.msg);
                        }
                    })
                }).catch(function (err) {
                });
            },
            showDeleteSuite(recycleView){
                if(recycleView===true){
                    this.recycle.recycleView=true;
                    this.recycle.active="0";
                    this.filter.viewMySuite = false;
                    this.getListByPage();
                }else{
                    this.recycle.recycleView=false;
                    this.recycle.active="1";
                    this.getListByPage();
                }
            },
            batchRestore(self){
                let ref = this;
                let ids =[];
                if(self===1){
                    if(this.multipleSelection.length < 1){
                        return this.$notify.error("请至少选择一个测试集！");
                    }
                    ids = this.getIdFromList(this.multipleSelection);
                }else{
                    ids=[self.id];
                }
                restoreSuite({id : ids}).then(function (response) {
                    if(response.data.code === 0){
                        ref.$message.success("还原成功！")
                        ref.getListByPage();
                    }
                    else{
                        ref.$message.error(response.data.msg);
                    }
                })
            },
            viewMySuite(){
                this.getListByPage();
            }
        }
    }
</script>

<style scoped>
    ._right {
        display: block;
        float: right;
    }

    ._table {
        height: 690px;
        overflow: auto;
        margin-top: 15px;
    }

    ._table2 {
        height: 490px;
        overflow: auto;
        margin-top: 20px;
    }

    .el-table::before{
        height: 0;
    }

    .block {
        float: right;
        margin-top: 15px;
    }

    .el-tag + .el-tag {
        margin-left: 10px;
        margin-top: 8px;
    }
    ._configTitle{
        font-size: 16px;
        margin: 10px 0;
    }
</style>
