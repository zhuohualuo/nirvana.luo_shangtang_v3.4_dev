<template>
    <div id="businessCode">
        <el-row>
            <el-tabs v-model="activeName2"  @tab-click="handleClick" tab-position="top" editable @edit="handleTabsEdit">
                <el-tab-pane v-for="(item,index) in hostList" :key="index" :label="item" :name="item">
                    <el-form :inline="true" class="_bottom0 demo-form-inline tabRight">
                        <el-form-item>
                            <el-button type="success" plain size='small' @click="updateCode">更新代码</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="success" plain size='small' @click="updataCodeLog">查看更新记录</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="success" plain size='small' @click="changeSetup(true)" v-if="isSetup===false">查看Setup</el-button>
                            <el-button type="success" plain size='small' @click="changeSetup(false)" v-else>查看用例</el-button>
                        </el-form-item>
                        <div class="_right">
                            <el-form-item style="margin-top:10px">
                                <div style="display: inline-flex">
                                    <span class="timeStyle">GitLab地址：</span>
                                    <a class="git-address" :href="git_address" target="_blank" :title="git_address">{{git_address}}</a>
                                </div>
                                <span class="timeStyle" style="margin-right: 40px;">注册时间：{{time}}</span>
                                <span class="timeStyle">管理员：{{ManagerName}}</span>
                            </el-form-item>
                        </div>
                    </el-form>
                    <el-table :data="businessCardList" border class="_table">
                        <el-table-column show-overflow-tooltip prop="name"  width="350" label="名称"></el-table-column>
                        <el-table-column show-overflow-tooltip prop="entry"  label="入口"></el-table-column>
                        <el-table-column show-overflow-tooltip prop="author" width="150" label="作者"></el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
            <div style="text-align:center;color:#666666" v-show="isshow">
                <span>暂无数据</span>
            </div>
        </el-row>

        <el-dialog title="更新记录" :visible.sync="dialogFormVisible" width="40%">
            <el-table :data="updateLog" border class="_table2">
                <el-table-column show-overflow-tooltip prop="product_name" label="项目名称" width="120"></el-table-column>
                <el-table-column show-overflow-tooltip prop="result" label="更新结果" width="100"></el-table-column>
                <el-table-column show-overflow-tooltip prop="date" label="更新时间"></el-table-column>
                <el-table-column show-overflow-tooltip prop="operator" label="操作人"></el-table-column>
                <el-table-column label="操作" width="100">
                    <template slot-scope="scope">
                        <el-button @click="handleShowDetial(scope.row)" type="text" size="small">查看</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
            </div>
        </el-dialog>
        
        <el-dialog title="更新代码" :visible.sync="dialogUpdataFrom" width="30%">
            <el-form ref="form" :model="updataCodeForm" label-width="80px">
                <el-form-item label="代码分支">
                    <el-input v-model="updataCodeForm.name"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogUpdataFrom = false">取 消</el-button>
                <el-button type="primary" @click="dialogUpdataFs">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog :title="isSucces" :visible.sync="dialogResponesLog" @close="clearInterval">
            <div v-html="dialogResponesLogBox" :style="{color:colorState?'rgb(255 0 0)':'#67C23A'}" style="height: 300px;overflow: auto;" id="dialogResponesLogRef">
            </div>
            
            <div slot="footer" class="dialog-footer">
                <el-button @click="clearInterval">取 消</el-button>
                <el-button type="primary" @click="clearInterval">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="新增项目代码" :visible.sync="dialogAddProject" width="55%">
            <el-row>
                <el-form :model="form" ref="form" :rules="formRule">
                    <el-col :span="8">
                        <el-form-item label="项目" prop="product" :label-width="formLabelWidth">
                            <el-select v-model="form.product" placeholder="项目" clearable  size='small'>
                                <el-option v-for="item in projectList" :value="item.id+','+item.name+','+item.description" :key="item.id" :label="item.name"></el-option>
                            </el-select>    
                        </el-form-item>  
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="分支" prop="branch" :label-width="formLabelWidth" size='small'>
                            <el-input v-model.trim="form.branch" auto-complete="off"  placeholder="请输入分支名！"></el-input>
                        </el-form-item> 
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="保存目录" prop="repository" :label-width="formLabelWidth" size='small'>
                            <el-input v-model.trim="form.repository" auto-complete="off" size="small"></el-input>   
                        </el-form-item>
                    </el-col>
                    <el-col>
                        <el-form-item label="GitLab地址" prop="address" :label-width="formLabelWidth" size='small' >
                            <el-input v-model.trim="form.address" auto-complete="off" placeholder="请输入GitLab项目URL！" size="small" @change="autoRepository"></el-input>   
                        </el-form-item>
                    </el-col>
                </el-form>
            </el-row>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogAddProject = false">取 消</el-button>
                <el-button type="primary" @click="addTab('form')">确 定</el-button> 
            </div>
        </el-dialog>

        <el-dialog title="日志详情" :visible.sync="dialogLogDetial" width="30%" >
            <div v-html="LogDetial" style="height:400px;overflow: auto;">
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogLogDetial = false">关 闭</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import { updateBusinessCode, reloadBusinessCode, updateBusinessLog ,getBusinessList,getBusinessDetail,addBusiness,delBusiness,getPropress,getBranch} from '@/api/precision';
    import {getProjectList} from '@/api/project';
    export default {
        name:'businessCode',
        data(){
            var validateGitAddress = (rule, value, callback) => {
                let expGitAddress = /^http.*git$/;
                if (value === '') {
                    callback(new Error('GitLab地址不能为空！'));
                }else if(!expGitAddress.test(value)){
                    callback(new Error('仅支持Http开头的GitLab地址！'));
                }else{
                    callback();
                }
            };
            return {
                colorState:false,
                isSucces:'',
                dialogResponesLogBox:'',
                dialogResponesLog:false,
                dialogUpdataFrom:false,
                updataCodeForm:{
                    name:''
                },
                hostList: [],
                updateLog:[],
                time:'',
                ManagerName:'',
                git_address:'',
                businessCardList:[],
                activeName2:'viper',
                dialogFormVisible: false,
                dialogAddProject : false,
                formLabelWidth: '120px',
                form: {
                    address : '',
                    branch : 'master',
                    product:'',
                    repository:'',
                    product_id:'',
                    product_name:'',
                    description:'',
                },
                formRule: {
                    address: { required: true, validator: validateGitAddress, trigger: 'blur' },
                    branch: { required: true, message: '请输入分支名！', trigger: 'blur' },
                    product: { required: true, message: '请选择项目！', trigger: 'change' },
                },
                projectList: [],
                tabConfig:{
                    dialogAddTab:false,
                    loadingInfo:""
                },
                intervalId: '',
                dialogLogDetial : false,
                LogDetial: '',
                isSetup:false,
                businessSetupList:[],
                isshow:false,
            }
        },
        mounted(){
            this.getProject();
            this.init();
        },
        watch: {
            dialogResponesLogBox(){
                this.$nextTick(()=>{
                    this.holdScroll("dialogResponesLogRef");
                })
            }
        },
        methods:{
             handleClick(tab, event) {
                this.getCodeDetail(this.activeName2)
            },
            getCodeDetail(ven){
                let self = this;
                getBusinessDetail({
                        product_name:ven
                    }).then(e=>{
                        if(e.data.code === 0){
                            if(e.data.msg===""){
                                var temp = Object.values(e.data.result)[0];
                                self.time = temp.register_time;
                                self.ManagerName = temp.admin;
                                self.git_address = temp.git_address;
                                if(self.isSetup === true){
                                    self.businessCardList = temp.setup;
                                }else{
                                    self.businessCardList = temp.case;
                                }
                            }else{
                                self.$message.success(e.data.msg); 
                            }
                        }else{
                            self.businessCardList = [];
                            self.time = '';
                            self.ManagerName = '';
                            self.$message.error(e.data.msg); 
                        }
                        
                    })
            },
            init(){
                getBusinessList().then(e=>{
                    if(e.data.code === 0){
                        this.hostList = e.data.result;
                        if(this.hostList.length===0){
                             this.isshow =true;
                        }else{
                            this.isshow =false;
                            this.activeName2 = this.hostList[0];
                            this.getCodeDetail(this.activeName2);
                        }
                    }else{
                        this.$message.warning(e.data.msg);
                    }
                })
            },
            dialogUpdataFs(){
                this.dialogResponesLogBox = "";
                this.dialogUpdataFrom = false;
                updateBusinessCode({
                    product_name:this.activeName2,
                    branch:this.updataCodeForm.name
                }).then(e=>{
                     if(e.data.code === 0){
                        this.getCodeDetail(this.activeName2);
                        this.dialogResponesLog = true;
                        this.colorState = false;
                        this.isSucces = '正在更新...'
                        this.intervalId = window.setInterval(()=>{
                            this.getPropress(e.data.id);
                        },1000);
                    }else{
                        this.colorState = true;
                        this.dialogResponesLog = true;
                        this.isSucces = '更新失败'
                        this.dialogResponesLogBox = e.data.msg.replace(/\n/g,'<br/>');
                    }
                })
            },
            updataCodeLog(){
                updateBusinessLog({
                    product_name:this.activeName2
                }).then(e=>{
                    if(e.data.code === 0){
                        this.dialogFormVisible = true;
                        this.updateLog = e.data.result;
                    }else{
                        this.$message.error(e.data.msg);
                    }
                })
            },
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            handleTabsEdit(targetName, action){
                if(action === 'add'){
                    this.dialogAddProject = true;
                }
                if(action === 'remove'){
                    this.delTab(targetName);
                }
            },
            validateFormRule(formName){
                let result = false;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        console.log("validate true")
                        result = true;
                    }
                    else {
                        console.log("validate false")
                    }
                })
                return result;
            },
            delTab(targetName){
                let self = this;
                if(targetName!=""&&targetName!=undefined){
                     this.$confirm('此操作将永久删除项目, 是否继续?', '删除', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                        }).then(() => {
                            delBusiness({product_name:targetName}).then(response=>{
                                if(response.data.code===0){
                                    self.$message({type: 'success', message: response.data.msg});
                                    self.init();  
                                }else{
                                    self.$message({type: 'error', message: response.data.msg});
                                }
                            }).catch(err=>{
                                self.$message({type:"error",message:err});
                            })
                        }).catch(() => {
                    }); 
                }
            },
            addTab(formName){
                let self = this;
                if(this.validateFormRule(formName)){
                    this.convertData();
                    addBusiness({
                        address : this.form.address,
                        branch : this.form.branch,
                        repository : this.form.repository,
                        product_id : this.form.product_id,
                        product_name : this.form.product_name,
                        description : this.form.description,
                    }).then(response=>{
                        if(response.data.code===0){
                            self.$message({type: 'success', message: response.data.msg});
                            self.dialogAddProject = false;
                            self.init(); 
                            self.resetForm("form");
                        }else{
                            self.$message({type: 'error', message: response.data.msg});
                        }
                        
                    }).catch(err=>{
                        self.$message({type:"error",message:err});
                    })
                }else{
                    return false;
                }
            },
            getPropress(businessId){
                let self = this;
                getPropress({id:businessId}).then(response=>{
                    let result = response.data.result;
                    let code = response.data.code;
                    if(code===0){
                        if(result==="RUNNING"){
                            self.dialogResponesLogBox = response.data.log.replace(/\n/g,'<br/>'); 
                        }
                        if(result==="WAITING"){
                            self.isSucces = "更新失败"
                            self.colorState = true;
                            window.clearInterval(this.intervalId);
                        }
                        if(result==="SUCCESS"){
                            self.isSucces = "更新成功"
                            self.dialogResponesLogBox = response.data.log.replace(/\n/g,'<br/>'); 
                            self.getCodeDetail(this.activeName2);
                            window.clearInterval(this.intervalId);
                        }
                        if(result==="FAILED"){
                            self.isSucces = "更新失败"
                            self.dialogResponesLogBox = response.data.log.replace(/\n/g,'<br/>'); 
                            self.colorState = true;
                            window.clearInterval(this.intervalId);
                        }
                    }
                    if(code===3){
                        self.colorState=true;
                        self.isSucces = '更新失败'
                        self.dialogResponesLogBox = response.data.msg.replace(/\n/g,'<br/>'); 
                        window.clearInterval(this.intervalId);
                    }
                }).catch(err=>{
                    self.$message({type:"error",message:err});
                    window.clearInterval(this.intervalId);
                })
            },
            convertData(){
                let product = this.form.product.split(",");
                if(product!=null){
                    this.form.product_id = product[0];
                    this.form.product_name = product[1];
                    this.form.description = product[2];
                }
            },
            autoRepository(value){
                let expGitProjectName = /([^<>/\\\|:""\*\?]+)\.\w+$/;
                let ProjectName = expGitProjectName.exec(value);
                if(ProjectName != null){
                    this.form.repository = ProjectName[1];
                }
            },
            resetForm(formName){
                this.$refs[formName].resetFields();
            },
            clearInterval(){
                this.dialogResponesLog = false;
                window.clearInterval(this.intervalId);
            },
            handleShowDetial(row){
                this.dialogLogDetial = true;
                if(row.log==""){
                    this.LogDetial = "<p style='text-align: center;'>暂无数据</p>";
                }else{
                    this.LogDetial = row.log.replace(/\n/g,'<br/>');
                }
            },
            changeSetup(obj){
                if(obj===true){
                    this.isSetup = true;
                }else{
                    this.isSetup = false;
                }
                this.getCodeDetail(this.activeName2);
            },
            getBranch(){
                let self = this;
                getBranch({product_name:self.activeName2}).then(function (response) {
                    if(response.data.code===0){
                        self.updataCodeForm.name = response.data.result;
                    }else{
                        self.$message({type:"error",message:response.data.result});
                    }
                }).catch(function (err) {
                    self.$message({type:"error",message:err});
                });
            },
            updateCode(){
                this.dialogUpdataFrom = true;
                this.getBranch();
            },
            holdScroll(elementId){
                let element = document.getElementById(elementId);
                element.scrollTop = element.scrollHeight;
            }
        } 
    }
</script>

<style scoped>
    ._table {
        height: 650px;
        overflow: auto;
    }

    ._table2 {
        height: 490px;
        overflow: auto;
    }

    .el-table::before{
        height: 0;
    }

    .timeStyle{
       color: #666666;
    }

    .text-wrapper {
        white-space: pre-wrap;
    }
    ._right {
        display: block;
        float: right;
    }
    .el-form-item__content .el-input-group{
        vertical-align: unset;
    }
    .git-address{
        margin-right : 40px;
        color : #666666;
        width : 200px;
        text-overflow : ellipsis;
        overflow : hidden;
        white-space : nowrap;
        display : block;
    }
    .git-address:hover{
        color : #43988a;
    }
</style>
<style>
    #businessCode .el-tabs--card>.el-tabs__header .el-tabs__item.is-active {
        background: #ddf6d1;
    }
    .el-tabs__new-tab{
        transform: scale(1.7, 1.7);
        border: 1px solid #43988a;
    }
    .el-tabs__new-tab .el-icon-plus:hover{
        color: #43988a
    }
</style>

