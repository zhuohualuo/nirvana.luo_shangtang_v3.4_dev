<template>
    <div id="contents">
        <el-row v-show="!isTrueDetail">
            <el-form :inline="true" class="_bottom0 demo-form-inline">
                <el-form-item>
                    <el-button type="primary" size='small' @click="addBackup">备 份</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size='small' @click="recoverySelf1()">恢 复</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size='small' @click="dialogCleanHost = true">环境清理</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="info" size='small' @click="addTestLink">检查工具版本</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="warning" size='small' @click="viewDetail">查看状态</el-button>
                </el-form-item>
            </el-form>
        </el-row>
        <el-row v-show="isTrueDetail">
            <div class="_left">
                <el-button type="warning" size='small' @click="isTrueDetail = false">返回备份列表</el-button>
            </div>
            <el-form :inline="true" class="_bottom0 demo-form-inline" style="float: right">
                <el-form-item>
                    <el-select v-model="backupsStatusType"
                               placeholder="筛选类型"
                               @change="seachStatusType">
                        <el-option label="UNITY" value="UNITY"></el-option>
                        <el-option label="UNITY_ES" value="UNITY_ES"></el-option>
                        <el-option label="FOUNDRY" value="FOUNDRY"></el-option>
                        <el-option label="FOUNDRY_ES" value="FOUNDRY_ES"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size='small' @click="updateBackupsStatus()">刷 新</el-button>
                </el-form-item>
            </el-form>
        </el-row>
        <el-row v-show="!isTrueDetail">
            <el-table :data="List.programData" ref="table"
                      height="730" border class='_table' header-cell-class-name="_table-head">
                <el-table-column type="index" label="序号" width="55"></el-table-column>
                <el-table-column show-overflow-tooltip prop="host" label="host" width="140"></el-table-column>
                <el-table-column show-overflow-tooltip prop="main_id" label="main_id" width="180"></el-table-column>
                <el-table-column show-overflow-tooltip prop="begindate" label="begindate" width="180"></el-table-column>
                <el-table-column show-overflow-tooltip prop="ebddate" label="ebddate" width="180"></el-table-column>
                <el-table-column show-overflow-tooltip prop="type" label="type" width="150"></el-table-column>
                <el-table-column show-overflow-tooltip prop="name" label="name"></el-table-column>
                <el-table-column show-overflow-tooltip prop="dbinfo" label="dbinfo" width="150"></el-table-column>
                <el-table-column show-overflow-tooltip prop="pvcinfo" label="pvcinfo" width="150"></el-table-column>
                <el-table-column prop="operation" label="操作" width="200">
                    <template slot-scope='props'>
                        <el-row>
                            <el-col :span='12'>
                                <el-button type='text' @click='changeSelf1(props.row)' class="op-btm">编 辑</el-button>
                            </el-col>
                            <el-col :span='12'>
                                <el-button type='text' @click='deleteSelf1(props.row)' class="op-btm _danger">删 除</el-button>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>

        <el-row v-show="isTrueDetail">
            <el-table :data="statusInfo"
                      height="730" border class='_table' header-cell-class-name="_table-head">
                <el-table-column type="index" label="序号" width="55"></el-table-column>
                <el-table-column show-overflow-tooltip prop="host" label="host" width="140"></el-table-column>
                <el-table-column show-overflow-tooltip prop="backup" label="backup" width="180"></el-table-column>
                <el-table-column show-overflow-tooltip prop="backupdate" label="backupdate" width="180"></el-table-column>
                <el-table-column show-overflow-tooltip prop="recover" label="recover" width="180"></el-table-column>
                <el-table-column show-overflow-tooltip prop="recoverdate" label="recoverdate" width="180"></el-table-column>
                <el-table-column show-overflow-tooltip prop="clean" label="clean" width="180"></el-table-column>
                <el-table-column show-overflow-tooltip prop="cleandate" label="cleandate" width="180"></el-table-column>
                <el-table-column show-overflow-tooltip prop="detail" label="detail"></el-table-column>
                <el-table-column label="操作" width="150">
                    <template slot-scope='props'>
                        <el-row>
                            <el-button type='text' @click='viewHostDetail(props.row)' class="op-btm">详 细</el-button>
                        </el-row>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>

        <el-dialog
                :title="'版本：'+versionInfo.version"
                :visible.sync="dialogVisible"
                width="30%">
            <div v-if="versionInfo.history&&versionInfo.history[versionInfo.version].length">
                <el-col v-for="(item,index) in versionInfo.history[versionInfo.version]" :key="index">{{item}}</el-col>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog
                title="新增备份"
                :visible.sync="addDialogVisible"
                width="30%">
            <el-form :model="addBackupsParame" ref="addForm" :disabled="isView"  style="width: 80%" >
                <el-form-item label="host" :label-width="formLabelWidth" prop="host"
                    :rules="{validator: checkHost, required: true, trigger: 'blur'}">
                    <el-input v-model.trim="addBackupsParame.host" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="user" :label-width="formLabelWidth"  >
                    <el-input v-model.trim="addBackupsParame.user" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="passwd" :label-width="formLabelWidth" >
                    <el-input v-model.trim="addBackupsParame.passwd" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="type" :label-width="formLabelWidth"  >
                    <el-select v-model="addBackupsParame.type" style="width: 70%">
                        <el-option label="UNITY" value="UNITY"></el-option>
                        <el-option label="UNITY_ES" value="UNITY_ES"></el-option>
                        <el-option label="FOUNDRY" value="FOUNDRY"></el-option>
                        <el-option label="FOUNDRY_ES" value="FOUNDRY_ES"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="remote_user" :label-width="formLabelWidth"  >
                    <el-input v-model.trim="addBackupsParame.remote_user" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="name" :label-width="formLabelWidth"  >
                    <el-input v-model.trim="addBackupsParame.name" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addDialogVisibles('addForm')">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="恢复信息" :visible.sync="recoverDialogVisible">
            <el-row>
                <el-form :model="recoverParame" ref="recoverForm">
                    <el-col :span="6">
                        <el-form-item label="host" label-width="50px" :rules="{validator: checkHost, required: true, trigger: 'blur'}" prop="host">
                            <el-input v-model.trim="recoverParame.host" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="user" label-width="50px">
                            <el-input v-model.trim="recoverParame.user" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="passwd" label-width="70px">
                            <el-input v-model.trim="recoverParame.passwd" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="type" label-width="50px" prop="type">
                            <el-select v-model="recoverParame.type">
                                <el-option label="UNITY" value="UNITY"></el-option>
                                <el-option label="UNITY_ES" value="UNITY_ES"></el-option>
                                <el-option label="FOUNDRY" value="FOUNDRY"></el-option>
                                <el-option label="FOUNDRY_ES" value="FOUNDRY_ES"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-form>
            </el-row>
            <config-table :tableColumn="tableColumn" :tableData="configForm" :height="390"></config-table>

            <div slot="footer" class="dialog-footer">
                <el-button @click="recoverDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="recoverDialogVisibles('recoverForm')">保 存</el-button>
            </div>
        </el-dialog>

        <el-dialog title="备份恢复状态" :visible.sync="dialogVisibleDetail">
            <el-tabs type="border-card">
                <template v-for="(item,index) in viewHostDetailList">
                    <el-tab-pane :label="index" :key="index">
                        <el-form  v-if="item&&item.length">
                            <el-form-item v-for="(it,inde) in item" :key="inde">
                                <el-col v-for="(ite,ind) in it" :key="ind">
                                    <span style="font-weight:900">{{ind}}：</span>{{ite}}
                                </el-col>
                            </el-form-item>
                        </el-form>
                        <el-form v-else>
                            <el-form-item>
                                <span>{{item[index]}}</span>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                </template>
            </el-tabs>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogVisibleDetail = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="更新备份信息" :visible.sync="dialogFormVisible">
            <el-form :model="form" ref="form" :disabled="isView"  style="width: 80%">
                <el-form-item label="host" :label-width="formLabelWidth" prop="host" >
                    <el-input v-model.trim="form.host" auto-complete="off" disabled></el-input>
                </el-form-item>
                <el-form-item label="main_id" :label-width="formLabelWidth" prop="main_id" >
                    <el-input v-model.trim="form.main_id" auto-complete="off" disabled></el-input>
                </el-form-item>
                <el-form-item label="begindate" :label-width="formLabelWidth" prop="begindate" >
                    <el-input v-model.trim="form.begindate" auto-complete="off" disabled></el-input>
                </el-form-item>
                <el-form-item label="ebddate" :label-width="formLabelWidth" prop="ebddate" >
                    <el-input v-model.trim="form.ebddate" auto-complete="off" disabled></el-input>
                </el-form-item>
                <el-form-item label="type" :label-width="formLabelWidth" prop="type" >
                    <el-input v-model.trim="form.type" auto-complete="off" disabled></el-input>
                </el-form-item>
                <el-form-item label="name" :label-width="formLabelWidth" prop="name" >
                    <el-input v-model.trim="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="dbinfo" :label-width="formLabelWidth" prop="dbinfo" >
                    <el-input v-model.trim="form.dbinfo" auto-complete="off" type="textarea" disabled></el-input>
                </el-form-item>
                <el-form-item label="pvcinfo" :label-width="formLabelWidth" prop="pvcinfo">
                    <el-input v-model.trim="form.pvcinfo" auto-complete="off" type="textarea" disabled></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitTestLink('form')">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="环境清理" :visible.sync="dialogCleanHost">
            <el-form :model="cleanHost" :disabled="isView"  style="width: 80%" ref="cleanForm">
                <el-form-item label="host" :label-width="formLabelWidth" prop="host" :rules="{validator: checkHost, required: true, trigger: 'blur'}">
                    <el-input v-model.trim="cleanHost.host" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="user" :label-width="formLabelWidth" >
                    <el-input v-model.trim="cleanHost.user" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="passwd" :label-width="formLabelWidth"  >
                    <el-input v-model.trim="cleanHost.passwd" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="type" :label-width="formLabelWidth" >
                    <el-select v-model="cleanHost.type" style="width: 70%">
                        <el-option label="UNITY" value="UNITY"></el-option>
                        <el-option label="UNITY_ES" value="UNITY_ES"></el-option>
                        <el-option label="FOUNDRY" value="FOUNDRY"></el-option>
                        <el-option label="FOUNDRY_ES" value="FOUNDRY_ES"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="remote_user" :label-width="formLabelWidth" >
                    <el-input v-model.trim="cleanHost.remote_user" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogCleanHost = false">取 消</el-button>
                <el-button type="primary" @click="dialogCleanHosts('cleanForm')">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import ConfigTable from "../../components/ConfigTable/index";
    import { BackupInterface, RecoveryInterface, getStatus, cleanInterface, getBackupStatus, getBackupInfo, updateBackupName, getBackupVersion, deleteBackup} from '@/api/others';
    import moment from 'moment';

    export default {
        name: 'backups',
        components: {ConfigTable},
        data() {
            return {
                checkHost: (rule,value,callback)=>{
                    console.log(value)
                    if(!value){
                        callback(new Error('Host 不能为空'))
                    }
                    if(!(/((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)/.test(value))){
                        callback(new Error('请正确输入Host'))
                    }
                    if(/[\u4e00-\u9fa5]/.test(value)){
                        callback(new Error('host不可包含中文'))
                    }
                    else{
                        callback()
                    }
                },
                backupsStatusType:'',
                isTrueDetail:false,
                configForm:[],
                cleanHost:{
                    "host": "192.20.25.190",//#待备份环境IP，FOUNDRY环境未任一masterIP
                    "user": "root",//#默认使用root用户，可不填
                    "passwd": "V1p3r1@#$%",//#默认密码为"V1p3r1@#$%"，可不填"
                    "type": "UNITY",//#备份环境类型，STATIC_DB，TIMESPACE_DB，STRUCT_DB，FOUNDRY，FOUNDRY_STRUCT
                    "remote_user": "",//#操作人，默认为调用API的服务器ip，可不填
                },
                statusInfo:[],
                viewHostDetailList:[],
                versionInfo:{},
                dialogCleanHost:false,
                addDialogVisible:false,
                recoverDialogVisible:false,
                dialogVisible: false,
                dialogVisibleDetail:false,
                addBackupsParame:{
                    "host": "192.20.25.190",//#待备份环境IP，FOUNDRY环境未任一master IP
                    "user": "root",//#默认使用root用户，可不填
                    "passwd": "V1p3r1@#$%",//#默认密码为 "V1p3r1@#$%"，可不填
                    "type": "UNITY",//#备份环境类型，STATIC_DB，TIMESPACE_DB，STRUCT_DB，FOUNDRY，FOUNDRY_STRUCT
                    "remote_user":12354,//#操作人，默认为调用API的服务器ip，可不填
                    "name": ""//#改备份场景的描述，不做唯一性校验
                },
                recoverParame:{
                    "host": "",//#待备份环境IP，FOUNDRY环境未任一master IP
                    "user": "root",//#默认使用root用户，可不填
                    "passwd": "V1p3r1@#$%",//#默认密码为 "V1p3r1@#$%"，可不填
                    "type": "UNITY",//#备份环境类型，STATIC_DB，TIMESPACE_DB，STRUCT_DB，FOUNDRY，FOUNDRY_STRUCT
                    "remote_user":"",//#操作人，默认为调用API的服务器ip，可不填
                    "UNITY": "",
                    "ES_UNITY":''
                },
                form: {
                    host: '',
                    main_id: '',
                    begindate: '',
                    ebddate: '',
                    type: '',
                    name: '',
                    dbinfo: '',
                    pvcinfo: '',
                },
                formLabelWidth: '120px',
                dialogFormVisible: false,
                editDisable: false,
                isView: false,
                List: {
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                tableColumn:[
                    {label:"参数",key:"name",type:"select",optionList:[
                        {label:"UNITY", value:"UNITY"},
                        {label:"UNITY_ES", value:"UNITY_ES"},
                        {label:"FOUNDRY", value:"FOUNDRY"},
                        {label:"FOUNDRY_ES", value:"FOUNDRY_ES"},
                    ]},
                    {label:"值",key:"value",type:"input"},
                ],
            }
        },
        mounted() {
            this.initList();
        },
        computed: {
            ...mapGetters([
                'name'
            ])
        },
        methods: {
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
            seachStatusType(){
                getBackupStatus({type:this.backupsStatusType}).then(e=>{
                    if(e.data){
                        this.statusInfo = e.data;
                        this.statusInfo.map(item=>{
                            item.detail = JSON.stringify(item.detail)
                        })
                        this.statusInfo.map((item,index)=>{
                            if(item.backup == 'backuping'||item.recover == 'recovering'||item.clean == 'cleaning'){
                                this.statusInfo.splice(index,1)
                                this.statusInfo.splice(0,0,item)
                            }
                        })
                    }else{
                        this.$message.error('请求出错')
                    }
                })
            },
            updataApi(){
                getBackupStatus().then(e=>{
                    if(e.data){
                        this.statusInfo = e.data;
                        this.statusInfo.map(item=>{
                            item.detail = JSON.stringify(item.detail)
                        })
                        this.statusInfo.map((item,index)=>{
                            if(item.backup == 'backuping'||item.recover == 'recovering'||item.clean == 'cleaning'){
                                this.statusInfo.splice(index,1)
                                this.statusInfo.splice(0,0,item)
                            }
                        })
                    }else{
                        this.$message.error('请求出错')
                    }
                })
            },
            updateBackupsStatus(){
                this.backupsStatusType = '';
                this.updataApi();
            },
            removeConfigParam(index){
                this.configForm.splice(index,1)
            },
            addConfigParam(){
                this.configForm.splice(0,0,{name: '', value: ''})
            },
            dialogCleanHosts(name){
                if(this.validateFormRule(name)){
                     this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(()=> {
                        cleanInterface(this.cleanHost).then( e=>{
                            if(e.data.result){
                                this.$message.success(e.data.result);
                                this.initList();
                            }else{
                                this.$message.error(e.data.err);
                            }
                        }).catch(function (err) {
                        })
                    }).catch(() => {})
                }
            },
            initList(){
                getBackupInfo().then((response)=>{
                    this.List.programData = response.data;
                }).catch(function (err) {
                });
            },
            addDialogVisibles(name){
                if(this.validateFormRule(name)){
                    BackupInterface(this.addBackupsParame).then(e=>{
                        if(e.data.result){
                            this.initList();
                            this.$message.success(e.data.result)
                        }else{
                            if(e.data.err){
                                this.$message.error(e.data.err)
                            }else{
                                this.$message.error('备份出错')
                            }

                        }
                    })
                    this.addDialogVisible = false;
                }

            },
            viewDetail(){
                this.isTrueDetail = true;
                this.updataApi();

            },
            viewHostDetail(self){
                this.dialogVisibleDetail = true;
                getStatus(self.host).then(e=>{
                    if(e.data){
                        this.viewHostDetailList = e.data;
                    }else{
                        this.$message.error('请求出错')
                    }
                })
            },
            changeSelf1(self) {
                this.form = self;
                this.editDisable = true;
                this.dialogFormVisible = true;
            },
            recoverDialogVisibles(name){
                if(this.validateFormRule(name)){
                    var temp = {};
                    for(let item of this.configForm){
                        if(item.value === ''){
                            this.$notify.error("参数对应的值不可以为空！");
                            return false;
                        }
                        else{
                            if(temp[item.name]){
                                this.$notify.error("不可以选择相同的 " + item.name + " 字段");
                                return false;
                            }else{
                                var type = this.recoverParame.type;
                                if(type == 'UNITY'){
                                    if(item.name == 'UNITY'||item.name == 'UNITY_ES'){
                                        temp[item.name] = item.value;
                                    }else{
                                        this.$notify.error('type为UNITY时，'+item.name + '不可以有');
                                        return false;
                                    }
                                }else if(type == 'FOUNDRY'){
                                    if(item.name == 'FOUNDRY'||item.name == 'FOUNDRY_ES'){
                                        temp[item.name] = item.value;
                                    }else{
                                        this.$notify.error('type为FOUNDRY时，'+item.name + '不可以有');
                                        return false;
                                    }

                                }
                            }
                        }
                    };
                    RecoveryInterface({
                        "host": this.recoverParame.host,
                        "user": this.recoverParame.user,
                        "passwd": this.recoverParame.passwd,
                        "type": this.recoverParame.type,
                        "remote_user": this.recoverParame.remote_user,
                        "data": temp
                    }).then(e=>{
                        if(e.data.result){
                            this.$notify({
                                title: '成功',
                                message: e.data.result,
                                type: 'success',
                                duration: 2000
                            })

                        }else{
                            this.$notify.error(e.data.err);
                        }
                    })
                }
            },
            recoverySelf1(self) {
                this.recoverParame.remote_user = this.name;
                this.recoverDialogVisible = true;
            },
            deleteSelf1(self){
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteBackup({
                        "type":self.type,
                        "main_id":self.main_id
                    }).then( e=>{
                        if(e.data.result){
                            this.$message.success("删除成功！");
                            this.initList();
                        }else{
                            this.$message.error(e.data.err);
                        }
                    }).catch(function (err) {
                    })
                }).catch(() => {})

            },
            addBackup(){
                this.addDialogVisible = true;
            },
            addTestLink(){
                getBackupVersion().then(e=>{
                    if(e.data){
                        this.versionInfo = e.data;
                        this.dialogVisible = true;
                    }else{
                        this.$message.error('error')
                    }
                })

            },
            submitTestLink(name){
                this.dialogFormVisible = false;
                updateBackupName({
                    "type":this.form.type, //#备份环境类型，STATIC_DB，TIMESPACE_DB，STRUCT_DB，FOUNDRY，FOUNDRY_STRUCT
                    "main_id":this.form.main_id,//#备份数据的唯一标识，通过列举备份信息接口获得
                    "name":this.form.name
                }).then(e=>{
                    if(e.data.result){
                        this.$notify({
                            title: '成功',
                            message: e.data.result,
                            type: 'success',
                            duration: 2000
                        })

                    }else{
                        this.$notify.error(e.data.err);
                    }
                })
            },

            //时间格式化
            dateFormat(row, column) {
                let date = row[column.property];
                if (date === undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            getIdFromList(list){
                let tmp = [];
                list.forEach(function(item){
                    tmp.push(item.id)
                })
                return tmp;
            },
        }
    }
</script>
<style scoped>
    .block {
        float: right;
        margin-top: 15px;
    }
    .configStyle{
        margin-left: 4%;
        width: 500px;
    }
    .op-btm {
        text-decoration:underline;
    }
    ._danger {
        color: #F56C6C
    }
</style>
<style>
    #contents .el-tooltip__popper {
        max-width: 400px;
        line-height: 180%;
        max-height: 500px;
    }
    .configStyle .el-form-item__content{
        display: flex;
    }
</style>

