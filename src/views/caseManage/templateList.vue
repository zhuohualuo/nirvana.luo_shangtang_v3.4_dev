<template>
    <div id="content">
        <el-row>
            <div class="_left">
                <el-button type="primary" size='small' @click="gotoAdd" icon="el-icon-plus">新 增</el-button>
            </div>
            <advance-filter :formData="form" :filterArray="filterArray" @search="seachCondition"></advance-filter>
        </el-row>

        <el-row>
            <el-table :data="templateList.programData"
                      height="680" border class='_table' header-cell-class-name="_table-head">
                <!--<el-table-column show-overflow-tooltip prop="id" label="id" width="55"></el-table-column>-->
                <el-table-column type="index" width="55" label="序号"></el-table-column>
                <el-table-column show-overflow-tooltip prop="title" label="模板名称"></el-table-column>
                <el-table-column show-overflow-tooltip label="项目/版本/模块/接口" width="300">
                    <template slot-scope="scope">
                        <span>{{scope.row.project}} / {{scope.row.version}}{{(scope.row.module?' / '+scope.row.module:'')+(scope.row.record?' / '+scope.row.record:'')}}</span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="type" label="类型" width="100" :formatter="typeFormat"></el-table-column>
                <el-table-column show-overflow-tooltip prop="owner" label="创建人" width="150"></el-table-column>
                <el-table-column show-overflow-tooltip prop="created_time" label="创建日期" :formatter="dateFormat" width="160"></el-table-column>
                <el-table-column show-overflow-tooltip prop="updated_time" label="修改日期" :formatter="dateFormat" width="160"></el-table-column>
                <table-operator :operateArray="operateArray"></table-operator>
            </el-table>
        </el-row>

        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[20, 30, 50, 100, 150]"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                           :total="templateList.count">
            </el-pagination>
        </div>

        <el-dialog title="模板内容" :visible.sync="contentVisible">
            <span>{{title}}</span>
            <div style="overflow: auto;max-height: 490px;border: 1px solid #dcdfe6;">
                <pre>{{content}}</pre>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="contentVisible = false">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>
<script>
    import { FilterProject, FilterVersion, FilterModule,FilterRecord,FilterCaseType } from '@/common/index';
    import AdvanceFilter from '@/components/AdvanceFilter/index.vue';
    import TableOperator from "../../components/TableOperator/index";
    import { getProjectList,getVersionList, getModuleList } from '@/api/project';
    import { getCaseTypeList, getInterfaceList, getTemplateList, generateTemplateCase, deleteTemplate } from '@/api/case';
    import moment from 'moment' //引入moment格式化时间

    export default {
        name:'templateList',
        data() {
            return {
                projectList: [],
                versionList: [],
                moduleList: [],
                recordList: [],
                templateList: {
                    page_no: 1,//页面开始页码
                    page_size: 20,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                form: {
                    title:'',
                    type:'',
                    owner:'',
                    project_id: '',
                    version_id: '',
                    module: '',
                    record_id: ''
                },
                formLabelWidth: '120px',
                List: [],
                pageNums: 20,//每页几条
                pageNum: 1 ,//当前是第几页,
                contentVisible: false,
                title: '',
                content: '',
                filterArray:[
                    {type :'select',name:"项目版本",key:"version_id",optionList:[],visible: this.getFilterVersion,
                        change:()=>{this.form.module='';this.form.record_id=''}},
                    {type :'select',name:"类型",key:"type",optionList:[],visible:this.getFilterTypeList},
                    {type :'input',name:"模板名称",key:"title"},
                    {type :'select',name:"模块",key:"module",optionList:[],visible:this.getFilterModule,
                        change:()=>{this.form.record_id=''},disable:()=>{return this.form.version_id===''}},
                    {type :'select',name:"接口",key:"record_id",optionList:[],visible:this.getFilterRecord,
                        disable:()=>{return this.form.module===''}},
                    {type :'input',name:"创建人",key:"owner"},
                ],
                operateArray: [
                    {label:'查看', click:this.viewTemplate},
                    {label:'编辑',  click:this.gotoEdit},
                    {label:"生成用例", click:this.gotoGenerate},
                    {label:'删除', click:this.deleteSelf1}
                ],
            }
        },
        computed: {
        },
        components:{
            AdvanceFilter,TableOperator
        },
        mounted() {
            this.initList();
            this.getCaseType();
            this.getAllVersion();
        },
        methods: {
            getAllVersion(){
                let self = this;
                getVersionList().then(function (response) {
                    let list = [];
                    for(let version of response.data.version){
                        list.push({label: version.project+'-'+version.version, value: version.id})
                    }
                    self.versionList = list;
                }).catch(function (err) {
                });
            },
            viewTemplate(self){
                this.title = self.title;
                try{
                  this.content = JSON.stringify(JSON.parse(self.json), null, 4);
                }
                catch(err){
                  console.log(err)
                  this.content = self.json;
                }
                this.contentVisible = true;
            },
            gotoAdd(){
                this.$router.push({
                    path: 'caseManage/createTemplate',
                    name: 'createTemplate'
                })
                this.$store.dispatch('app/toggleChildNav', '/autoTest/templateList');
            },
            gotoEdit(self){
                this.$router.push({
                    path: 'caseManage/createTemplate',
                    name: 'createTemplate',
                    params: {
                        dataObj: self
                    }
                })
                this.$store.dispatch('app/toggleChildNav', '/autoTest/templateList');
            },
            getInterface(flag){
                if(flag === true){
                    let self = this;
                    getInterfaceList({
                        // project_id: self.form.project_id,
                        version_id: self.form.version_id,
                        module: self.form.module
                    }).then(function (response) {
                        console.log(response)
                        self.recordList = response.data.api_records;
                    }).catch(function (err) {
                    });
                }
            },
            getCaseType(){
                let self = this;
                getCaseTypeList().then(function (response){
                    console.log(response)
                    self.caseTypeList = response.data.types;
                }).catch(function (err) {
                });
            },
            initList(){
                let self = this;
                getTemplateList({
                    page_no: self.pageNum,
                    page_size: self.pageNums,
                    type: self.form.type,
                    title:self.form.title,
                    owner:self.form.owner,
                    project_id :self.form.project_id,
                    version_id: self.form.version_id,
                    module: self.form.module,
                    record_id: self.form.record_id
                }).then(function (response) {
                    console.log(response)
                    self.templateList  = {
                        page_no: self.pageNum,
                        page_size: 20 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.templates
                    }
                })
            },
            //时间格式化
            dateFormat(row, column) {
                var date = row[column.property];
                if (date == undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            typeFormat(row, column){
                let type = row[column.property];
                let tmp = this.caseTypeList.filter((item)=>{
                    return item.id === type;
                })
                if(tmp.length > 0){
                    return tmp[0].type_name;
                }
                else{
                    return "";
                }
            },
            deleteSelf1(self) {
                let ref=this
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteTemplate(self.id).then(function (response) {
                        if (response.data.code === 0) {
                            ref.$message.success("删除成功！");
                            ref.initList();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    }).catch(function (err) {
                    });
                }).catch(() => {})
            },
            gotoGenerate(self){
                let ref = this;
                generateTemplateCase(self).then(function (response) {
                    console.log(response)
                    if(response.data.code === 0){
                        ref.$message.success('生成成功!');
                        ref.gotoSave(response.data, self.project + "_" + self.version);
                    }else{
                        ref.$message.error(response.data.msg);
                    }
                }).catch(function (error) {
                    console.log(error);
                    ref.$message.error('提交失败!');
                });
            },
            gotoSave(self, string){
                this.$router.push({
                    path: 'caseManage/templateCaseList',
                    name: 'templateCaseList',
                    params: {
                        dataObj: {
                            data: self,
                            projectVersion: string
                        }
                    }
                })
                this.$store.dispatch('app/toggleChildNav', '/autoTest/templateList');
            },
            seachCondition(){
                this.pageNum = 1;
                this.initList();
            },
            handleSizeChange(val) {//改变每页显示数
                this.pageNum = 1;
                this.pageNums = val;
                this.initList();
            },
            handleCurrentChange(val) {//改变页码
                this.pageNum = val;
                this.initList();
            },
            getFilterRecord(item){
                FilterRecord(item,this.form);
            },
            getFilterTypeList(item){
                FilterCaseType(item,this.form);
            },
            getFilterVersion(item){
                item.optionList = this.versionList;
            },
            getFilterModule(item){
                FilterModule(item, this.form);
            },
        }
    }
</script>
<style scoped>
    .block {
        float: right;
        margin-top: 15px;
    }

    .el-tag + .el-tag {
        margin-left: 10px;
        margin-top: 8px;
    }
</style>
<style>
.el-dialog__title{
    max-width: 90%;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>

