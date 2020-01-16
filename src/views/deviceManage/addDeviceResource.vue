<template>
    <div id="content">
        <!--<el-card>-->
        <el-row>
            <el-form :model="formValidate" :rules="ruleValidate" ref="formValidate">
                <el-col :span="5">
                    <el-form-item label="备注" :label-width="formLabelWidth" prop="description">
                        <el-input ref='description' v-model.trim="formValidate.description" placeholder="请输入备注" auto-complete="off" clearable></el-input>
                    </el-form-item>
                </el-col>
            </el-form>
        </el-row>
        <div>
            <el-row style="width:100%">
                <el-table
                :data="formValidate.nodeInfoList"
                :model='formValidate'
                 height="660" border class='_table' header-cell-class-name="_table-head"
                stripe style="overflow: auto">
                    <el-table-column type="index" label="序号" width="130">
                    </el-table-column>
                    <el-table-column label="机器IP" width="300">
                        <template slot-scope="scope">
                            <el-input ref='ip' v-model="scope.row.ip" clearable></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="BMC_IP" width="300">
                        <template slot-scope="scope">
                            <el-input ref='ipmi_host' v-model="scope.row.ipmi_host" clearable></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="BMC_username" width="300">
                        <template slot-scope="scope">
                            <el-input ref='ipmi_username' v-model="scope.row.ipmi_username" clearable></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="BMC_password" width="300">
                        <template slot-scope="scope">
                            <el-input ref='ipmi_password' v-model="scope.row.ipmi_password" clearable></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column v-if="macVisible" label="MAC地址" width="300">
                        <template slot-scope="scope">
                            <el-input ref='mac' v-model="scope.row.mac"
                            placeholder="自动获取，获取失败时请自行填写" clearable></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column  width="300" align="center" :render-header="renderHeader">
                        <template slot-scope='props'>
                            <el-button @click='copyItem(props.$index)' type="text" class="op-btm">
                                复制
                            </el-button>
                            <el-button @click='removeItem(props.$index, formValidate.nodeInfoList)' type="text" style="color:#F56C6C" class="op-btm">删除
                            </el-button>
                            <!--上移 下移-->
                            <el-button type="text" :disabled="props.$index===0"  @click="moveUp(props.$index,props.row)" style="color:orange" class="op-btm">
                            上移
                            </el-button>
                            <el-button type="text" :disabled="props.$index===(formValidate.nodeInfoList.length-1)"  @click="moveDown(props.$index,props.row)" style="color:orange" class="op-btm">
                            下移
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
        </div>
        <div class="page-footer-right" style="left:85%">
            <el-button type="primary" @click="handleSubmit('formValidate')">提交</el-button>
            <el-button type="ghost" @click="handleReset()" style="margin-left: 8px">重置</el-button>
            <el-button type="ghost" @click="cancelEdit()" style="margin-left: 8px">取消</el-button>
        </div>
    </div>
</template>

<script>
    import { getDeviceList, addDevice, updateDevice, deleteDevice, rentDevice, returnDevice, reinstallSystemDevice, reinstallInfraDevice } from '@/api/deviceResource';
    import Cookies from "js-cookie";
    let loading
    export default {
        name:'addDevice',
        data () {
            return {
                formValidate: {
                    name: 1,
                    description: '',
                    nodeInfoList: [{
                        ip: "",
                        ipmi_host: "",
                        ipmi_username: "",
                        ipmi_password: "",
                        mac: ""
                    }],
                    id: ''
                },
                formLabelWidth: '80px',
                ruleValidate: {
                    description: [
                        { required: true, message: '请填写备注', trigger: 'blur' }
                    ],
                    ip: [
                        { required: true, message: '机器ip不能为空', trigger: 'blur' }
                    ],
                    ipmi_host: [
                        { required: true, message: 'BMC_IP不能为空', trigger: 'blur' }
                    ],
                    ipmi_username: [
                        { required: true, message: 'BMC用户名不能为空', trigger: 'blur' }
                    ],
                    ipmi_password: [
                        { required: true, message: 'BMC密码不能为空', trigger: 'blur' }
                    ],
                    mac: [
                        { required: true, message: 'MAC地址不能为空', trigger: 'blur' }
                    ]
                },
                macVisible: false,
                loading: false
            }
        },//data

        computed: {},//computed

        mounted() {
            this.getParams()
        },
        beforeDestroy () {
            this.$store.dispatch("app/toggleParentNav");
        },
        methods: {
            //向上移动
            moveUp(index,row) {
                var that = this;
                if (index > 0) {
                let upDate = that.formValidate.nodeInfoList[index - 1];
                that.formValidate.nodeInfoList.splice(index - 1, 1);
                that.formValidate.nodeInfoList.splice(index,0, upDate);
                } else {
                alert('已经是第一条，不可上移');
                }
            },
            //向下移动
            moveDown(index,row){
                var that = this;
                if ((index + 1) === that.formValidate.nodeInfoList.length){
                alert('已经是最后一条，不可下移');
                } else {
                let downDate = that.formValidate.nodeInfoList[index + 1];
                that.formValidate.nodeInfoList.splice(index + 1, 1);
                that.formValidate.nodeInfoList.splice(index,0, downDate);
                }
            },
            getParams () {
                if(this.$route.params.dataObj){
                    this.formValidate.description = this.$route.params.dataObj.description;
                    this.formValidate.id = this.$route.params.dataObj.id;
                    this.formValidate.nodeInfoList = this.$route.params.dataObj.nodeinfo;
                    this.ip_flag = true
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
                        this.$message.error("备注不能为空！");
                    }
                })
                return result;
            },
            checkContent(){
                // 校验机器ip和BMC_IP是否符合IP规则
                var reg =/^(?:(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:1[0-9][0-9]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:2[0-4][0-9])|(?:25[0-5])|(?:1[0-9][0-9])|(?:[1-9][0-9])|(?:[0-9]))$/;
                var re = new RegExp(reg);

                if(this.formValidate.description == ''){
                    this.$message.error("备注不能为空！");
                    this.$refs.description.focus();
                    return false
                }
                // 循环遍历nodeinfolist数组，不能为空
                for ( let i of this.formValidate.nodeInfoList){
                    // console.log("遍历得到的每台机器配置：", i);
                    if(i.ip === ''){
                        this.$message.error("机器IP不能为空！");
                        //this.$refs.ip.focus();
                        return false
                    };
                    if(!re.test(i.ip.trim())){
                        this.$message.error("请填写有效的机器IP，注意检查是否包含空格！");
                        //this.$refs.ip.focus();
                        return false
                    };
                    if(i.ipmi_host === ''){
                        this.$message.error("BMC_IP不能为空！");
                        //this.$refs.ipmi_host.focus();
                        return false
                    };
                    if(!re.test(i.ipmi_host.trim())){
                        this.$message.error("请填写有效的BMC_IP！");
                        //this.$refs.ipmi_host.focus();
                        return false
                    };
                    if(i.ipmi_username === ''){
                        this.$message.error("BMC_username不能为空！");
                        //this.$refs.ipmi_username.focus();
                        return false
                    };
                    if(i.ipmi_password === ''){
                        this.$message.error("BMC_password不能为空！");
                        //this.$refs.ipmi_password.focus();
                        return false
                    };
                    if(i.mac === '' && this.macVisible==true){
                        this.$message.error("MAC地址不能为空！");
                        //this.$refs.mac.focus();
                        return false
                    };
                    }
                return true
            },

            handleSubmit(name) {
                if (this.checkContent()) {
                    //有id表示是做修改，没有表示是新增
                    let ref = this;
                    if (ref.formValidate.id > 0 ){
                        // 如果更新的话，先把之前的mac地址清空，然后再登陆获取
                        if (ref.macVisible==false){
                            for(var j=0,len=ref.formValidate.nodeInfoList.length;j < len;j++){
                                ref.formValidate.nodeInfoList[j].mac = ''
                            };
                        };
                        let update_data = {
                            description: ref.formValidate.description,
                            nodeinfo: ref.formValidate.nodeInfoList,
                            project_id: Cookies.get("platform")
                        };
                        ref.open3();
                        updateDevice(update_data, ref.formValidate.id).then(function (response) {
                            if(response.data.code === 200){
                                loading.close();
                                ref.$message.success('修改成功!');
                                ref.goToDeviceList();
                                ref.handleReset();
                            }else if(response.data.code === 501){
                                loading.close();
                                // 将已经获得的mac地址回显到mac框
                                for(var j=0,len=ref.formValidate.nodeInfoList.length;j < len;j++){
                                    ref.formValidate.nodeInfoList[j].mac = response.data.mac_list[j]
                                };
                                ref.macVisible = true;
                                ref.open2(response.data.msg)
                            }
                            else{
                                loading.close();
                                ref.open2(response.data.msg);
                            }
                        }).catch(function (error) {
                            console.log(error);
                        });
                    }
                    else{
                        // 构造请求体
                        // console.log("platform：", this.$cookies.get("platform"))
                        let body_data = {
                            "description": this.formValidate.description,
                            "nodeinfo": this.formValidate.nodeInfoList,
                            "project_id": Cookies.get("platform"),  // 获取业务线id
                            "renter": this.$store.state.user.uid_name
                        };
                        // console.log("请求体：", body_data)
                        ref.open3()
                        addDevice(body_data).then(function (response) {

                            if (response.data.code === 501){
                                loading.close();
                                // 将已经获得的mac地址回显到mac框
                                // console.log(response.data.mac_list);
                                for(var j=0,len=ref.formValidate.nodeInfoList.length;j < len;j++){
                                    ref.formValidate.nodeInfoList[j].mac = response.data.mac_list[j]
                                }
                                // console.log("填充mac后：", ref.formValidate.nodeInfoList);
                                ref.macVisible = true;
                                ref.open2(response.data.msg);
                            }
                            else if(response.data.code === 200){
                                loading.close();
                                ref.$message.success('机器添加成功，并自动租借到你名下，请在机器列表中查看！');
                                ref.goToDeviceList();
                            }else if(response.data.code === 500){
                                loading.close();
                                ref.$message.error(response.data.msg);
                            }
                        }).catch(function (error) {
                            console.log(error);
                        });
                    }
                }
                else{
                    return false;
                }
            },

            // 保存成功提示
            open1() {
            loading.close()
            this.$message({
                showClose: true,
                message: '保存成功！',
                type: 'success'
                });
            },

            // 保存失败提示
            open2(msg) {
                loading.close()
                this.$message({
                showClose: true,
                message: msg,
                type: 'error'
                });
            },

            // 获取mac地址提示
            open3() {
                loading=this.$loading({
                lock: true,
                text: '正在登录服务器获取MAC地址，请稍等...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
                });
                // setTimeout(() => {
                // loading.close();
                // }, 30000);
            },

            handleReset () {
                this.$refs["formValidate"].resetFields();
                this.formValidate = {
                    name: 1,
                    description: '',
                    nodeInfoList: [{
                        ip: "",
                        ipmi_host: "",
                        ipmi_username: "",
                        ipmi_password: "",
                        mac: ""
                    }],
                    id: ''
                };
                this.macVisible = false
            },

            // 增加机器
            addItem(){
                this.formValidate.nodeInfoList.push({ip: "", ipmi_host: "", ipmi_username: "", ipmi_password: "", mac: ""});
                // console.log("增加后：", this.formValidate.nodeInfoList);
            },

            // 移除机器
            removeItem(index, item){
                // this.contentList.splice(index,1)
                if (item.length <= 1) {
                    this.$message.error("禁止删除最后一条记录！");
                    return false
                }
                else{
                    this.formValidate.nodeInfoList.splice(index, 1);
                    // console.log("移除后：", this.formValidate.nodeInfoList);
                }
            },

            // 修改成功或者添加成功后跳转到机器列表
            goToDeviceList(){
                this.$router.push({
                    path: "deviceManage/device",
                    name: "device"
                })
            },

            // 取消编辑并返回到机器列表
            cancelEdit() {
                let ref = this;
                this.$confirm('取消编辑并返回机器列表界面, 内容将不保存，是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).then(() => {
                ref.goToDeviceList()
                })
            },

            // 实现复制上一条记录的功能
            copyItem(index){
                let tmp = Object.assign({}, this.formValidate.nodeInfoList[index]);
                this.formValidate.nodeInfoList.push(tmp);
            },

            // 实现增加条目
            renderHeader(h, { column, $index }){
                return h('el-button', {
                    props: { icon: 'el-icon-plus', type: 'primary', size: 'mini'},
                    on: {
                        click: () => {
                            this.addItem()
                        }
                    }
                })
            },
        }
    }
</script>

<style scoped>
    ._switch {
        margin: 0 0 20px 20px;
    }
</style>


<style>
    .el-transfer-panel{
        width: 45%;
    }
    .el-transfer-panel__body{
        height: 430px;
    }
    .el-transfer-panel__list{
        height: 390px !important;
    }
    .op-btm{
    text-decoration: underline;
    }
</style>
