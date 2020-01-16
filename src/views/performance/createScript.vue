<template>
    <div id="createPerfScript">
        <el-card style="margin-left: 5%;width: 90%;height: 730px">
            <el-row>
                <el-form :model="formValidate" ref="formValidate">
                    <el-col :span="10">
                        <el-form-item label="任务名称" :label-width="formLabelWidth" prop="title"
                                      :rules="{validator: checkTitle, required: true, trigger: 'blur'}">
                            <el-input v-model.trim="formValidate.title" placeholder="请输入任务名称，不可以数字开头，不可包含中文" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>

                    <el-col :span="6" :offset="1">
                        <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id"
                                      :rules="{ required: true, message: '项目不能为空', trigger: 'change' }">
                            <el-select v-model="formValidate.project_id" style="width: 100%"
                                       @change="(val)=>{formValidate.project_id=val}">
                                <el-option
                                        v-for="(item,index) in projectList"
                                        :label="item.name"
                                        :value="item.id"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <el-col :span="5" :offset="1">
                        <el-form-item label="配置项" :label-width="formLabelWidth" prop="config_id">
                            <el-select v-model="formValidate.config_id"
                                       clearable placeholder="请选择" style="width: 100%"
                                       :disabled="formValidate.project_id===''"
                                       @visible-change="getConfig">
                                <el-option
                                        v-for="(item,index) in configList"
                                        :label="item.cfg_name"
                                        :value="item.id"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-form>
            </el-row>
            <el-row>
                <el-form :model="formValidate.task" ref="TaskForm">
                    <el-col :span="1">
                        <el-form-item label="执行标准" :label-width="formLabelWidth"></el-form-item>
                    </el-col>
                    <el-col :span="4" :offset="1">
                        <el-form-item :rules="{validator: checkMax, required: true, trigger: 'blur'}" prop="maxmenory">
                            <el-input placeholder="请输入最大内存" v-model.trim="formValidate.task.maxmenory">
                                <span slot="prepend">最大内存</span>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="4" :offset="1">
                        <el-form-item :rules="{validator: checkTh, required: true, trigger: 'blur'}" prop="thread">
                            <el-input placeholder="请输入线程数" v-model.trim="formValidate.task.thread">
                                <span slot="prepend">线程</span>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="4" :offset="1">
                        <el-form-item>
                            <el-input placeholder="请输入IP列表" v-model.trim="formValidate.task.iplist">
                                <span slot="prepend">IP列表</span>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="4" :offset="1">
                        <el-form-item :rules="{validator: checkJcyc, required: true, trigger: 'blur'}" prop="cycle">
                            <el-input placeholder="请输入循环次数" v-model.trim="formValidate.task.cycle">
                                <span slot="prepend">循环次数</span>
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-form>
            </el-row>
            <br/>
            <el-row>
                <el-col :span="5" :offset="8">
                    <el-upload
                            class="upload-demo"
                            ref="upload"
                            drag
                            multiple
                            action="/"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :file-list="fileList"
                            :on-change="handFileList"
                            :auto-upload='false'>
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击选取文件</em></div>
                        <div class="el-upload__tip" slot="tip">
                            <span>大小不超过50M</span>
                        </div>
                    </el-upload>
                </el-col>
            </el-row>
        </el-card>

        <div class="page-footer-right">
            <el-button type="ghost" @click="handleReset()" :disabled="isEdit">重置</el-button>
            <el-button type="primary" @click="handleSubmit('formValidate')" style="margin-left: 8px">提交</el-button>
        </div>

        <el-dialog title="修改文件名称" :visible.sync="currentVisible" width="30%">
            <el-form :model="tmpFile" ref="form" :rules="formRule">
                <el-form-item label="文件名称" label-width="80px" prop="name">
                    <el-input v-model.trim="tmpFile.name"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="currentVisible = false">取 消</el-button>
                <el-button type="primary" @click="changeName">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import { getProjectList } from '@/api/project';
    import { createPerfScript, updatePerfScript, perfUpload, getConfigList } from '@/api/performance';
    import JsonEditor from '@/components/JsonEditor';
    import axios from 'axios'
    import Cookies from "js-cookie";
    const rootPath = process.env.BASE_API;

    export default {
        name: "createPerfScript",
        components: { JsonEditor },
        data () {
            return {
                checkMax: (rule,value,callback)=>{
                    if(!(/^[0-9]*$/.test(this.formValidate.task.maxmenory))){
                        callback(new Error('输入数字'))
                    }
                    else{
                        callback()
                    }
                },
                checkTh: (rule,value,callback)=>{
                    if(!(/^[0-9]*$/.test(this.formValidate.task.thread))){
                        callback(new Error('输入数字'))
                    }
                    else{
                        callback()
                    }
                },
                checkJcyc: (rule,value,callback)=>{
                    if(!(/^[0-9]*$/.test(this.formValidate.task.cycle))){
                        callback(new Error('输入数字'))
                    }
                    else{
                        callback()
                    }
                },
                checkBac: (rule,value,callback)=>{
                    if(!(/^[0-9]*$/.test(this.formValidate.task.batch))){
                        callback(new Error('输入数字'))
                    }
                    else{
                        callback()
                    }
                },
                checkTitle: (rule,value,callback)=>{
                    if(!value){
                        callback(new Error('任务名称不能为空'))
                    }
                    if(/^\d/.test(value)){
                        callback(new Error('任务名称不可以数字开头'))
                    }
                    if(/[\u4e00-\u9fa5]/.test(value)){
                        callback(new Error('任务名称不可包含中文'))
                    }
                    else{
                        callback()
                    }
                },
                fileList: [],
                newFolderVisible: false,
                currentVisible: false,
                newFolderName: '',
                newFolderFather: {},
                newFileName: {},
                tmpFile: {
                    name: '',
                    size: ''
                },
                currentFile: {},
                formRule: {
                    name: [
                        { required: true, message: '请输入名称', trigger: 'blur' },
                        { max: 75, message: '名称长度不能超过75个字符', trigger: 'blur' },
                    ]
                },
                projectList: [],
                configList: [],
                strategyList: [],
                filter: {},
                jmxFilePath: [],
                formValidate: {
                    id: 0,
                    project_id: '',
                    config_id: '',
                    title: '',
                    task: {
                        minmenory: '',
                        maxmenory: '',
                        thread: '',
                        iplist: '',
                        cycle: '',
                        batch: ''
                    }
                },
                currentRow: {},
                formLabelWidth: '80px',
                isEdit: false,
                notifyPromise:Promise.resolve()
            }
        },
        mounted() {
            if(this.$route.params.dataObj) {
                this.formValidate = this.$route.params.dataObj;
                this.jmxFilePath = eval(this.formValidate.file_path)
                this.isEdit = true;
            }
            if(this.$route.params.filter){
                this.filter = this.$route.params.filter;
            }
            this.getProject();
            this.getConfig(true);
        },
        methods: {
            /*
            *  1.去掉file_path
            *  2.去掉pattern
            *  3.文件上传和配置上传合并到/add_jmeter接口
            *  4.有id>0 表示是做修改，没有表示是新增
            */
            //提交
            handleSubmitScript(name){
                //校验
                let flag = true;
                Object.values(this.formValidate.task).map(item=>{
                    if(item != ''){
                        flag = false
                    }
                })
                if((this.formValidate.config_id == '')&&flag){
                    return this.$message.error('配置项与执行标准其中一项不可以为空')
                }
                //校验表单
                if(this.validateFormRule(name)&&this.beforeFileUpload()){
                    //编辑文件可以为空 新增文件不能为空
                    if(!this.fileList.length&&!this.isEdit) return this.$message.error('上传文件不可以为空!')
                    //formData 上传对象 
                    let formData = new FormData();
                    this.fileList.map(item=>{
                        let file = item;
                        let uid = item.uid;
                        let name = '';
                        if(this.newFileName[uid]){
                            name = this.newFileName[uid];
                        }
                        else{
                            name = item.name;
                        }
                        formData.append('file', item.raw ,name);
                    })
                    formData.append('data',JSON.stringify(this.formValidate))
                    // 修改
                    if(this.formValidate.id>0){
                        /*
                        * 
                            1.有文件 判断是否继续 
                            2.没有文件,直接提交
                        */
                       if(this.fileList.length){
                           this.$confirm('文件上传操作会删除该任务的所有已有文件, 是否继续?', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            axios.put(
                            rootPath + '/perf/add_jmeter',
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                    'uidNumber': Cookies.get("uidNumber"),
                                    'token': Cookies.get('token'),
                                    'platform': Cookies.get("platform")
                                }
                            }).then( res => {
                                if(res.data.code === 0){
                                    this.$message.success('提交成功！');
                                    this.handleReset();
                                    this.goToList();
                                } else {
                                    this.$message.error(response.data.msg);
                                }
                            }).catch(function (error) {
                                console.log(error);
                            });
                        }).catch(() => {         
                        });
                       }else{
                           axios.put(
                            rootPath + '/perf/add_jmeter',
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                    'uidNumber': Cookies.get("uidNumber"),
                                    'token': Cookies.get('token'),
                                    'platform': Cookies.get("platform")
                                }
                            }).then( res => {
                                if(res.data.code === 0){
                                    this.$message.success('提交成功！');
                                    this.handleReset();
                                    this.goToList();
                                } else {
                                    this.$message.error(response.data.msg);
                                }
                            }).catch(function (error) {
                                console.log(error);
                            });
                       }
                    }else{
                        // 创建
                        axios.post(
                        rootPath + '/perf/add_jmeter',
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                'uidNumber': Cookies.get("uidNumber"),
                                'token': Cookies.get('token'),
                                'platform': Cookies.get("platform")
                            }
                        }).then( res => {
                            if(res.data.code === 0){
                                this.$message.success('提交成功！');
                                this.handleReset();
                            } else {
                                this.$message.error(response.data.msg);
                            }
                        }).catch(function (error) {
                            console.log(error);
                        });
                        
                    }
                }
            },
            handFileList(file,fileList){
                this.fileList = fileList;
                if(this.isEdit){
                    this.jmxFilePath.map((item,index)=>{
                        if(item.split('.')[item.split('.').length-1] == file.name.split('.')[file.name.split('.').length-1]){
                            this.jmxFilePath.splice(index,1)
                        }
                    })
                }
            },
            notify(msg){
                //通知，解决element-ui，同时调用notify时，通知重叠的问题
                this.notifyPromise = this.notifyPromise.then(this.$nextTick).then(()=>{
                    this.$notify({
                        type: 'error',
                        message: "'" + msg + "'文件类型不对！",
                    });
                })
            },
            goToList(){
                this.$router.push({
                    path: '/perf/perfTaskList',
                    name: 'perfTaskList',
                })
            },
            bytesToSize(bytes) {
                if (bytes === 0) return '0 B';
                let k = 1000, // or 1024
                    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                    i = Math.floor(Math.log(bytes) / Math.log(k));
                return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
            },
            beforeFileUpload(){
                let isJmx = false;
                this.fileList&&this.fileList.length&&(this.fileList.map(file=>{
                    if((/.*[\u4e00-\u9fa5]+.*$/.test(file.name))){
                        this.$message.error('文件名不可以为中文！')
                        isJmx = true;
                    }
                    const isLt50M = file.size / 1024 / 1024 < 50;
                    if(!isLt50M){
                        isJmx = true;
                        this.$notify({
                            message: "文件" + file.name + "超过50MB！当前大小："+this.bytesToSize(file.size),
                            type: 'error'
                        });
                    }
                }))
                if(this.fileList&&this.fileList.length){
                    let i = 0;
                    this.fileList.map(it=>{
                        if(it.name.split('.')[it.name.split('.').length-1] == 'jmx'){
                            i ++;
                        }
                    })
                    if(i >1){
                        isJmx = true
                        this.$message.error('不可以同时上传两个jmx文件!')
                    } 
                }
                if(isJmx){
                    return false
                }
                return true
            },
            append(data){
                this.newFolderFather = data;
                this.newFolderVisible = true;
            },
            addFolder(){
                let newChild = { label: this.newFolderName, children: [] };
                this.newFolderName = '';
                if (!this.newFolderFather.children) {
                    this.$set(this.newFolderFather, 'children', []);
                }
                this.newFolderFather.children.push(newChild);
            },
            handleRemove(file, fileList) {
                this.fileList = fileList;
            },
            handlePreview(file) {
                this.currentFile = file;
                this.tmpFile.name = file.name.toString();
                this.tmpFile.size = this.bytesToSize(file.size);
                this.currentVisible = true;
            },
            changeName(){
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        this.currentFile.name = this.tmpFile.name;
                        this.newFileName[this.currentFile.uid] = this.tmpFile.name;
                        this.currentVisible = false;
                    } else {
                        return false;
                    }
                });
            },
            async handleUpload(){
                let formData = new FormData();
                if(this.fileList.length){
                    this.fileList.map(item=>{
                        let file = item;
                        let uid = item.uid;
                        let name = '';

                        if(this.newFileName[uid]){
                            name = this.newFileName[uid];
                        }
                        else{
                            name = item.name;
                        }
                        formData.append('file', item.raw ,name);
                    })
                    let self = this;

                    await axios.post(
                        rootPath + '/perf/upload?pattern=jmx',
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                'uidNumber': Cookies.get("uidNumber"),
                                'token': Cookies.get("token"),
                                'platform': Cookies.get("platform")
                            }
                        }).then(function (res) {
                        if(res.data.code === 0){
                            // self.$notify({
                            //     message: "文件" + name + "上传成功！",
                            //     type: 'success'
                            // });
                            // item.onError();
                        } else {
                            self.$notify({
                                message: "文件" + name + "上传失败：" + res.data.msg,
                                type: 'error'
                            });
                        }
                    })
                }
            },
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects
                }).catch(function (err) {
                });
            },
            getConfig(flag){
                let self = this;
                if(flag == true){
                    getConfigList({project_id: self.formValidate.project_id}).then(function (response) {
                        self.configList = response.data.keys;
                    }).catch(function (err) {
                    });
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
            handleSubmit(name) {
                let flag = true;
                Object.values(this.formValidate.task).map(item=>{
                    if(item != ''){
                        flag = false
                    }
                })
                if((this.formValidate.config_id == '')&&flag){
                    return this.$message.error('配置项与执行标准其中一项不可以为空')
                }
                if (this.validateFormRule(name)) {
                    if(!this.fileList.length&&!this.isEdit) return this.$message.error('上传文件不可以为空!')
                    //有id表示是做修改，没有表示是新增
                    this.beforeFileUpload()&&this.handleUpload().then(e=>{
                        let ref = this;
                        this.formValidate['file_path'] = this.jmxFilePath;
                        if (ref.formValidate.id > 0 ){
                            updatePerfScript(ref.formValidate).then(function (response) {
                                if(response.data.code === 0){
                                    ref.$message.success('提交成功！');
                                    ref.handleReset();
                                    ref.goToList();
                                }else{
                                    ref.$message.error(response.data.msg);
                                }
                            }).catch(function (error) {
                                console.log(error);
                            });
                        }
                        else{
                            createPerfScript(ref.formValidate).then(function (response) {
                                if(response.data.code === 0){
                                    ref.$message.success('提交成功！');
                                    ref.handleReset();
                                }else{
                                    ref.$message.error(response.data.msg);
                                }
                            }).catch(function (error) {
                                console.log(error);
                            });
                        }
                    })
                }
                else{
                    return false;
                }
            },
            handleReset () {
                this.$refs["formValidate"].resetFields();
                this.formValidate = {
                    id: 0,
                    project_id: '',
                    title: '',
                    task: {
                        minmenory: '',
                        maxmenory: '',
                        thread: '',
                        iplist: '',
                        cycle: '',
                        batch: ''
                    }
                };
                this.jmxFilePath = [];
                this.fileList = [];
            },
        },
        beforeDestroy() {
            this.$store.dispatch('app/toggleParentNav')
        }
    }
</script>

<style scoped>
    ._tip{
        padding: 0 16px;
    }
</style>
<style>
    #createPerfScript{
        overflow: hidden;
    }
    #createPerfScript .el-upload-list.el-upload-list--text{
        width: 360px;
        max-height: 320px;
        overflow-y: auto;
    }
</style>

