<template>
    <div id="content">
        <el-row>
            <div class="_left">
                <el-button type="primary" size='small' @click="gotoAdd" icon="el-icon-plus">新 增</el-button>
                <el-button type="info" size='small' @click="SwaggerUpload">Swagger导入</el-button>
            </div>
            <advance-filter :formData="form" :filterArray="filterArray" @search="seachCondition" :showNumber="4"></advance-filter>
        </el-row>

        <el-row>
            <el-table :data="recordList.programData"
                      height="680" border class='_table' header-cell-class-name="_table-head">
                <!--<el-table-column show-overflow-tooltip prop="id" label="id" width="55"></el-table-column>-->
                <el-table-column type="index" width="55" label="序号"></el-table-column>
                <el-table-column show-overflow-tooltip prop="name" label="接口名称"></el-table-column>
                <el-table-column show-overflow-tooltip label="项目/版本/模块" width="250">
                    <template slot-scope="scope">
                        <span>{{scope.row.project}} / {{scope.row.version}} / {{scope.row.module}}</span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="url" label="URL" width="200"></el-table-column>
                <el-table-column show-overflow-tooltip prop="method" label="请求方法" width="80"></el-table-column>
                <el-table-column show-overflow-tooltip prop="owner" label="创建人" width="150"></el-table-column>
                <el-table-column show-overflow-tooltip prop="created_time" label="创建日期" :formatter="dateFormat" width="170"></el-table-column>
                <el-table-column show-overflow-tooltip prop="updated_time" label="修改日期" :formatter="dateFormat" width="170"></el-table-column>
                <table-operator :operateArray="operateArray"></table-operator>
            </el-table>
        </el-row>

        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[20, 30, 50, 100, 150]"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                           :total="recordList.count">
            </el-pagination>
        </div>

        <el-dialog title="接口内容" :visible.sync="contentVisible" width="40%" >
            <el-form :model="content" style="max-height: 500px;overflow-y: auto;">
                <el-form-item label="URL：">
                    <span>{{content.url}}</span>
                </el-form-item>
                <el-form-item label="请求方法：">
                    <span>{{content.method}}</span>
                </el-form-item>
                <el-form-item label="请求头：">
                    <span>{{content.headers}}</span>
                </el-form-item>
                <el-form-item label="请求体：">
                    <span>{{content.body}}</span>
                </el-form-item>
                <el-form-item label="校验条件：">
                    <span>{{content.validator}}</span>
                </el-form-item>
                <el-form-item label="预期结果：">
                    <span>{{content.expect}}</span>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="contentVisible = false">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import AdvanceFilter from "../../components/AdvanceFilter/index";
    import TableOperator from "../../components/TableOperator/index";
    import { FilterProject, FilterVersion, FilterModule } from '@/common/index';
    import { getProjectList, getVersionList, getModuleList } from '@/api/project';
    import { getInterfaceList, deleteInterface } from '@/api/case';
    import moment from 'moment' //引入moment格式化时间

    export default {
        name:'interfaceList',
        components: {AdvanceFilter, TableOperator},
        data() {
            return {
                // projectList: [],
                versionList: [],
                moduleList: [],
                recordList: {
                    page_no: 1,//页面开始页码
                    page_size: 20,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                form: {
                    project_id: '',
                    version_id: '',
                    module: '',
                    name: '',
                },
                formLabelWidth: '90px',
                pageNums: 20,//每页几条
                pageNum: 1 ,//当前是第几页,
                contentVisible: false,
                title: '',
                content: {},
                operateArray: [
                    {label:'查看', click:this.viewInterface},
                    {label:'编辑', click:this.gotoEdit},
                    {label:'删除', type:"danger", click:this.deleteSelf1}
                ],
                filterArray: [
                    {key:'project_id',name:'项目',type:'select',optionList:[],visible: this.getFilterProject,
                        change:()=>{this.form.version_id=''; this.form.module=''}},
                    {key:'version_id',name:'版本',type:'select',optionList:[],visible: this.getFilterVersion,
                        change:()=>{this.form.module=''},disable:()=>{return this.form.project_id===''}},
                    {key:'module',name:'模块',type:'select',optionList:[],visible: this.getFilterModule,
                        disable:()=>{return this.form.version_id===''}},
                    {key:'name',name:'接口名称',type:'input'},
                ],
            }
        },
        computed: {
            ...mapGetters([
                'projectList'
            ])
        },
        mounted() {
            this.initList();
            // this.getProject();
        },
        methods: {
            viewInterface(self){
                this.title = self.name;
                this.content = {
                    url: self.url,
                    method: self.method,
                    headers: JSON.stringify(self.headers),
                    body: JSON.stringify(self.body,null,2),
                    validator: JSON.stringify(self.validator,null,2),
                    expect: self.expect
                };
                this.contentVisible = true;
            },
            gotoAdd(){
                this.$router.push({
                    path: 'autoTest/createInterface',
                    name: 'createInterface'
                })
                this.$store.dispatch('app/toggleChildNav', '/autoTest/interfaceList')
            },
            gotoEdit(self){
                this.$router.push({
                    path: 'autoTest/updateInterface',
                    name: 'updateInterface',
                    params: {
                        dataObj: self
                    }
                })
                this.$store.dispatch('app/toggleChildNav', '/autoTest/interfaceList')
            },
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    // console.log(response)
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getVersion(flag){
                if(flag === true) {
                    let self = this;
                    getVersionList({project_id: self.form.project_id,}).then(function (response) {
                        self.versionList = response.data.version;
                    }).catch(function (err) {
                    });
                }
            },
            getModule(flag){
                if(flag === true) {
                    let self = this;
                    getModuleList({
                        project_id: self.form.project_id,
                        version_id: self.form.version_id
                    }).then(function (response) {
                        console.log(response)
                        self.moduleList = response.data.module;
                    }).catch(function (err) {
                    });
                }
            },
            getFilterProject(item){
                FilterProject(item)
            },
            getFilterVersion(item){
                FilterVersion(item, this.form)
            },
            getFilterModule(item){
                FilterModule(item, this.form)
            },
            initList(){
                let self = this;
                getInterfaceList({
                    page_no: self.pageNum,
                    page_size: self.pageNums,
                    project_id: self.form.project_id,
                    version_id: self.form.version_id,
                    module: self.form.module,
                    name: self.form.name
                }).then(function (response) {
                    console.log(response)
                    self.recordList  = {
                        page_no: self.pageNum,
                        page_size: 20 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.api_records
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
            deleteSelf1(self) {
                let ref=this
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteInterface(self.id).then(function (response) {
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
            SwaggerUpload(){
                this.$router.push({
                    name : "SwaggerUpload"
                })
                this.$store.dispatch('app/toggleChildNav', '/autoTest/interfaceList')
            }
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
