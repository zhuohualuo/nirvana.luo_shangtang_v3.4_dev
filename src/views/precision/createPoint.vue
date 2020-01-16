<template>
    <div id="content">
        <el-row style="margin-bottom: 20px">
            <el-button type="warning" size='small' class='float_lef' @click="gotoList">
                <svg-icon icon-class="return"></svg-icon> 返回测试点列表
            </el-button>
        </el-row>

        <el-card style="margin-left: 8%;width: 80%">
            <el-form :model="form" ref="form" :rules="formRule">
                <el-form-item label="项目" prop="product" :label-width="formLabelWidth">
                    <el-select v-model="form.product" auto-complete="off" style="width: 400px" @change="()=>{form.scene_id=''}">
                        <el-option
                                v-for="(item,index) in projectList"
                                :label="item.name"
                                :value="''+item.id"
                                :key="index">
                        </el-option>
                    </el-select>
                </el-form-item>
                <!--<el-form-item label="适用版本" prop="version" :label-width="formLabelWidth">-->
                <!--<el-select v-model="form.version " multiple auto-complete="off" style="width: 400px" @visible-change="getVersion" @change="()=>{form.scene_id=''}">-->
                <!--<el-option-->
                <!--v-for="(item,index) in versionList"-->
                <!--:label="item.version"-->
                <!--:value="''+item.id">-->
                <!--:key="index">-->
                <!--</el-option>-->
                <!--</el-select>-->
                <!--</el-form-item>-->
                <el-form-item label="场景" prop="scene_id" :label-width="formLabelWidth">
                    <el-select v-model="form.scene_id" auto-complete="off" style="width: 400px" @visible-change="getScene">
                        <el-option
                                v-for="(item,index) in sceneList"
                                :label="item.scene"
                                :value="item.id"
                                :key="index">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="测试点名称" prop="point" :label-width="formLabelWidth">
                    <el-input v-model.trim="form.point" auto-complete="off" style="width: 400px;"></el-input>
                </el-form-item>
                <el-form-item label="测试点说明" prop="description" :label-width="formLabelWidth">
                    <el-input v-model.trim="form.description" auto-complete="off" style="width: 400px;"></el-input>
                </el-form-item>
                <!--<el-form-item label="测试点入口" prop="entry" :label-width="formLabelWidth">-->
                <!--<el-input v-model="form.entry" auto-complete="off" style="width: 400px;"></el-input>-->
                <!--</el-form-item>-->
                <el-form-item :label-width="formLabelWidth">
                    <el-button type="primary" plain icon="el-icon-circle-plus" @click="addPointParam">增加参数</el-button>
                </el-form-item>
            </el-form>

            <el-tabs v-model="activeName">
                <el-tab-pane v-for="(item,index) in paraForm" :key="index" :name='""+index'>
                    <span slot="label">
                        <el-input style="width: 90px" v-model="item.key"></el-input>
                        <el-button type="text" size="mini" icon="el-icon-close" style="margin: 0;" @click="removePointParam(index)"></el-button>
                    </span>
                    <el-form :model="item" :ref="'paraForm_'+index">
                        <el-form-item label="参数说明：" prop="description" :label-width="formLabelWidth">
                            <el-input v-model="item.description" style="width: 55%" auto-complete="off"></el-input>
                        </el-form-item>
                        <el-form-item label="是否必选：" prop="require" :label-width="formLabelWidth">
                            <el-radio-group v-model="item.require">
                                <el-radio :label="true">是</el-radio>
                                <el-radio :label="false">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="参数类型：" prop="type" :label-width="formLabelWidth">
                            <el-radio-group v-model="item.type">
                                <el-radio label="text">文本</el-radio>
                                <el-radio label="file">文件</el-radio>
                                <el-radio label="single_select">单选</el-radio>
                                <el-radio label="multi_select">多选</el-radio>
                                <el-radio label="json">JSON</el-radio>
                                <el-radio label="dev">环境变量</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item v-show="item.type.indexOf('select') != -1"
                                      label="可选值列表："
                                      prop="options"
                                      :label-width="formLabelWidth"
                                      :rules="{required: item.type.indexOf('select') != -1, message: '请填写可选值列表', trigger: 'blur'}">
                            <el-input v-model="item.options" style="width: 55%" auto-complete="off"></el-input>
                            <i class="el-icon-question" style="color: #6699CC" title="可选值以英文逗号,区分"></i>
                        </el-form-item>
                        <el-form-item v-show="item.require == false"
                                      label="默认值："
                                      prop="default"
                                      :label-width="formLabelWidth"
                                      :rules="{required: item.require == false, message: '请填写默认值', trigger: 'blur'}">
                            <el-input v-model="item.default" style="width: 55%" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <el-row>
            <el-col :span="4" :offset="10">
                <br/>
                <el-button type="ghost" @click="resetForm">重置</el-button>
                <el-button type="primary" @click="savePoint" style="margin-left: 8px">提交</el-button>
            </el-col>
        </el-row>

    </div>
</template>

<script>
    import { getProjectList, getVersionList } from '@/api/project';
    import { createNewPoint, updatePoint, getSceneList } from '@/api/precision';

    export default {
        name: "createPoint",

        data(){
            return {
                activeName:"0",
                form: {
                    product: '',
                    // version: [],
                    scene_id: '',
                    point_id: '',
                    point: '',
                    description: '',
                    // entry: '',
                    form: []
                },
                paraForm: [{
                    key: '',
                    description: '',
                    type: 'text',
                    require: true,
                    options: '',
                    default: ''
                }],
                projectList: [],
                // versionList: [],
                sceneList: [],
                formLabelWidth: '120px',
                formRule: {
                    product: { required: true, message: '请选择项目', trigger: 'change' },
                    // version: { required: true, message: '请选择版本', trigger: 'change' },
                    scene_id: { required: true, message: '请选择场景', trigger: 'change' },
                    point: { required: true, message: '请填写测试点名称', trigger: 'blur' },
                    description: { required: true, message: '请填写测试点描述', trigger: 'blur' },
                    // entry: { required: true, message: '请填写测试点入口', trigger: 'blur' }
                }
            }
        },

        mounted() {
            this.getParams()
        },

        methods: {
            getParams () {
                // 取到路由带过来的参数
                console.log("$route.params.dataObj",this.$route.params.dataObj)
                if(this.$route.params.dataObj){
                    this.form = this.$route.params.dataObj;
                    this.getProject();
                    // this.getVersion(true);
                    this.getScene(true);
                    this.convertParaForm();
                }
                else{
                    this.getProject();
                }
            },
            addPointParam(){
                this.paraForm.push({
                    key: '',
                    description: '',
                    type: 'text',
                    require: true,
                    options: '',
                    default: ''
                })
            },
            removePointParam(index){
                this.paraForm.splice(index,1)
            },
            checkPointParam(){
                let result = true;
                let self = this;
                if(!self.validateFormRule(self.$refs['form'])){
                    result = false;
                }
                self.paraForm.forEach(function(item,index){
                    if((item.key != '')&&(!self.validateFormRule(self.$refs['paraForm_'+index][0]))){
                        result = false;
                    }
                })
                return result;
            },
            getPointParam(){
                let self = this;
                this.form.form = [];
                this.paraForm.forEach(function(item,index){
                    if(item.key != ''){
                        self.form.form.push(JSON.parse(JSON.stringify(item)));
                        if(self.form.form[index]){
                            let tmp = self.form.form[index]['options'];
                            if(tmp == ''){
                                self.form.form[index]['options'] = [];
                            }
                            else if(tmp != undefined){
                                self.form.form[index]['options'] = tmp.split(',');
                            }
                            else{
                            }
                        }
                    }
                })
            },
            savePoint() {
                let ref = this;
                if (ref.checkPointParam()) {
                    ref.getPointParam();
                    //存在point_id为修改，否则新增
                    if(ref.form.point_id != ''){
                        updatePoint(ref.form).then(function (response) {
                            console.log(response)
                            if (response.data.code === 0) {
                                ref.$message.success("保存成功！");
                                ref.gotoList();
                                ref.resetForm();
                            }
                            else {
                                ref.$message.error(response.data.msg);
                            }
                        })
                    }
                    else{
                        createNewPoint(ref.form).then(function (response) {
                            console.log(response)
                            if (response.data.code === 0) {
                                ref.$message.success("保存成功！");
                                // ref.gotoList();
                                ref.resetForm();
                            }
                            else {
                                ref.$message.error(response.data.msg);
                            }
                        })
                    }
                }
                else{
                    return false;
                }
            },
            validateFormRule(form){
                let result = false;
                form.validate((valid) => {
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
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    // console.log(response)
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getVersion(flag){
                if(flag == true){
                    let self = this;
                    getVersionList({project_id: self.form.product}).then(function (response) {
                        console.log(response)
                        self.versionList = response.data.version;
                    })
                }
            },
            getScene(flag){
                if(flag == true) {
                    let self = this;
                    getSceneList({
                        product: self.form.product,
                        version: '',
                    }).then(function (response) {
                        console.log(response)
                        self.sceneList = response.data.results;
                    })
                }
            },
            convertParaForm(){
                let self = this;
                this.paraForm = [];
                this.form.form.forEach(function(item,index){
                    self.paraForm.push(Object.assign({},item))
                    let tmp = self.paraForm[index]['options'];
                    if(tmp){
                        self.$set(self.paraForm[index], 'options', tmp.join(','))
                    }
                })
            },
            gotoList(){
                this.$router.push({
                    path: 'precision/testPointList',
                    name: 'testPointList'
                })
            },
            resetForm(){
                this.activeName = '0';
                this.form = {
                    product: '',
                    // version: [],
                    scene_id: '',
                    point_id: '',
                    point: '',
                    description: '',
                    // entry: '',
                    form: []
                };
                this.paraForm = [{
                    key: '',
                    description: '',
                    type: 'text',
                    require: true,
                    options: '',
                    default: ''
                }];
                this.$nextTick(() => {
                    this.$refs['form'].clearValidate()
                })
            }
        }

    }
</script>

<style scoped>

</style>
