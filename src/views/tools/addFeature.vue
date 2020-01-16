<template>
    <div class="app-container">
        <el-row>
            <el-col :span="10" :offset="1">
                <el-card style="height: 750px">
                    <div slot="header" class="card-header">
                        <span>静态特征入库</span>
                    </div>
                    <el-form :model="form1" ref="form1" :rules="form1Rule" style="height: 600px">
                        <el-form-item label="Host" :label-width="formLabelWidth" prop="host">
                            <el-input v-model="form1.host" auto-complete="off" style="width: 70%"></el-input>
                        </el-form-item>
                        <el-form-item label="端口" :label-width="formLabelWidth" prop="post">
                            <el-input v-model="form1.post" auto-complete="off" style="width: 70%"></el-input>
                        </el-form-item>
                        <el-form-item label="库类型" :label-width="formLabelWidth" prop="db_type">
                            <el-select v-model="form1.db_type" style="width: 70%">
                                <el-option label="静态库" value="static"></el-option>
                                <el-option label="布控库" value="alert"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="特征版本" :label-width="formLabelWidth" prop="feature_version">
                            <el-input v-model="form1.feature_version" auto-complete="off" style="width: 70%"></el-input>
                        </el-form-item>
                        <el-form-item label="入库数量" :label-width="formLabelWidth" prop="quantity">
                            <el-input v-model="form1.quantity" auto-complete="off" style="width: 70%"></el-input>
                        </el-form-item>
                        <el-form-item label="进程数" :label-width="formLabelWidth" prop="process_num">
                            <el-input v-model="form1.process_num" auto-complete="off" style="width: 70%"></el-input>
                        </el-form-item>
                        <el-form-item label="线程数" :label-width="formLabelWidth" prop="thread_num">
                            <el-input v-model="form1.thread_num" auto-complete="off" style="width: 70%"></el-input>
                        </el-form-item>
                        <el-form-item label="库Id" :label-width="formLabelWidth" prop="db_id">
                            <el-input v-model="form1.db_id" auto-complete="off" style="width: 70%"></el-input>
                        </el-form-item>
                    </el-form>
                    <div class="card-footer">
                        <el-button @click="resetForm1">重 置</el-button>
                        <el-button type="primary" @click="addFeature" key="1">入 库</el-button>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="10" :offset="2">
                <el-card style="height: 750px">
                    <div slot="header" class="card-header">
                        <span>入库进度查询</span>
                    </div>
                    <el-form :model="form2" ref="form2" :rules="form1Rule" style="height: 600px">
                        <el-form-item label="Host" :label-width="formLabelWidth" prop="host">
                            <el-input v-model="form2.host" auto-complete="off" style="width: 70%"></el-input>
                        </el-form-item>
                    </el-form>
                    <div class="card-footer">
                        <el-button type="primary" @click="queryProcess" key="2">查 询</el-button>
                    </div>
                </el-card>
                <el-card v-show="resultVisible">
                    <div slot="header" class="card-header">
                        <span>查询结果</span>
                    </div>
                    <div style="margin: 0 15%">
                        <el-form :model="result" label-position="left">
                            <el-form-item label="总入库数" :label-width="formLabelWidth">
                                <el-tag>{{result.total}}</el-tag>
                            </el-form-item>
                            <el-form-item label="成功数" :label-width="formLabelWidth">
                                <el-tag type="success">{{result.success}}</el-tag>
                            </el-form-item>
                            <el-form-item label="失败数" :label-width="formLabelWidth">
                                <el-tag type="danger">{{result.fail}}</el-tag>
                            </el-form-item>
                            <el-form-item label="状态" :label-width="formLabelWidth">
                                <el-tag type="warning">{{result.status}}</el-tag>
                            </el-form-item>
                            <el-form-item label="最高速率" :label-width="formLabelWidth">
                                <el-tag>{{result.rate}}</el-tag>
                            </el-form-item>
                            <el-form-item label="总耗时" :label-width="formLabelWidth">
                                <el-tag>{{result.total_time + ' s'}}</el-tag>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import { featureIntoDb, getFeatureStatus } from '@/api/others';

    export default {
        name: "addFeature",
        data(){
            var checkQuantity = (rule, value, callback) => {
                var tmp = parseInt(value);
                if(isNaN(tmp))
                {
                    callback(new Error('请输入数字'));
                }
                else if(tmp < 0){
                    callback(new Error('入库数量应大于0'));
                }
                else {
                    callback();
                }
            };
            var checkIPv4 = (rule, value, callback) => {
                var reg = /^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[1-9])(\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)){3}$/;
                var flag = reg.test(value);
                if(!flag)
                {
                    callback(new Error('不符合IPv4格式'));
                }
                else {
                    callback();
                }
            };
            return {
                form1: {
                    host: '',
                    port: '',
                    db_type: '',
                    feature_version: '',
                    quantity: '',
                    process_num: '',
                    thread_num: '',
                    db_id: ''
                },
                form2: {
                    host: ''
                },
                result: {},
                resultVisible: false,
                form1Rule: {
                    host: [
                        { required: true, message: '请输入Host', trigger: 'blur' },
                        { validator: checkIPv4, trigger: 'blur' },
                    ],
                    db_type: [{ required: true, message: '请选择库类型', trigger: 'change' }],
                    feature_version: [{ required: true, message: '请输入特征版本', trigger: 'blur' }],
                    quantity: [
                        { required: true, message: '请输入入库数量', trigger: 'blur' },
                        { validator: checkQuantity, trigger: 'blur' },
                    ],
                },
                form2Rule: {
                    host: [
                        { required: true, message: '请输入Host', trigger: 'blur' },
                        { validator: checkIPv4, trigger: 'blur' },
                    ],
                },
                formLabelWidth: '120px',
            }
        },

        methods: {
            addFeature(){
                let self = this;
                if (this.validateFormRule('form1')) {
                    featureIntoDb(self.form1).then(function (response) {
                        if(response.data.code===0){
                            self.$message.success("操作成功，正在入库特征，可查询入库进度！");
                            self.resetForm1();
                        }
                        else{
                            self.$message.error(response.data.msg);
                        }
                    }).catch(function (error) {
                        console.log(error);
                    });
                }
            },
            queryProcess(){
                let self = this;
                if (this.validateFormRule('form2')) {
                    getFeatureStatus(self.form2.host).then(function (response) {
                        if(response.data.code===0){
                            self.result = response.data.status;
                            self.resultVisible = true;
                        }
                        else{
                            self.$message.error(response.data.msg);
                        }
                    }).catch(function (error) {
                        console.log(error);
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
            resetForm1(){
                this.$refs["form1"].resetFields();
                this.form1 = {
                    host: '',
                    port: '',
                    db_type: '',
                    feature_version: '',
                    quantity: '',
                    process_num: '',
                    thread_num: '',
                    db_id: ''
                }
            },
        }
    }
</script>

<style scoped>
    .card-header{
        font-size: 18px;
        font-weight: bold;
    }

    .card-footer{
        display: block;
        float:right;
        margin-bottom: 15px
    }
</style>