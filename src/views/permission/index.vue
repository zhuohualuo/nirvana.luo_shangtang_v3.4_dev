<template>
    <div id="content">
        <el-row>
            <el-form :inline="true" class="_bottom0 demo-form-inline _right">
                <el-form-item>
                    <el-select v-model="platLine" placeholder="请选择业务线" @change="seachPlatLine" clearable>
                        <el-option
                                v-for="item in platAll"
                                :key="item.id"
                                :label="item.name"
                                :value="item.name">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="roleName" placeholder="请输入用户名(不区分大小写)" clearable></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size='small' circle @click="seachCondition" icon="el-icon-search"></el-button>
                </el-form-item>
            </el-form>
        </el-row>
        <el-row>
            <el-table :data="platformContainer"
                      height="720" border class='_table' header-cell-class-name="_table-head">
                <el-table-column type="index" width="55" label="序号"></el-table-column>
                <el-table-column show-overflow-tooltip prop="name" width="170" label="用户名" sortable></el-table-column>
                <el-table-column show-overflow-tooltip prop="platform" label="所在业务线" width="300">
                    <template slot-scope="props">
                    <span v-for="(item,index) in props.row.platform" :key="index">
                        <span v-for="(it,ind) in item" :key="ind">
                            {{ it }}；
                        </span>
                    </span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="role" label="业务线角色">
                    <template slot-scope="props">
                      <span v-for="(item,index) in props.row.role" :key="index">
                          {{index}}:{{ item =='0'?'超管':item =='1'?"管理员":'普通用户' }}；
                      </span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="updated_time" label="上次登入时间" width="180" :formatter="dateFormat"></el-table-column>
                <el-table-column prop="operation" label="操作" width="250">
                    <template slot-scope='props'>
                        <el-button type='text' style="text-decoration: underline"
                                   v-if="props.row.user_role !== 0"
                                   @click='edit(props.row)'>编辑权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>

        <el-dialog title='编辑权限' :visible.sync="dialogFormVisible">
            <span style="font-size: 18px;font-weight: bold">用户：{{form.name}}</span>
            <el-table :data="plat" height="490" border class='_table' header-cell-class-name="_table-head">
                <el-table-column show-overflow-tooltip prop="platform_name" label="业务线"></el-table-column>
                <el-table-column show-overflow-tooltip label="权限">
                    <template slot-scope='props'>
                        <el-radio-group v-model="checkList[props.row.platform_name]">
                            <el-radio :label="1">管理员</el-radio>
                            <el-radio :label="2">普通用户</el-radio>
                            <el-radio :label="3">无权限</el-radio>
                        </el-radio-group>
                    </template>
                </el-table-column>
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="dialogFormVisibles">保 存</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import { getUserList, getUserAuthorise, getUserManager } from '@/api/login';
    import moment from 'moment' //引入moment化简时间

    export default{
        name: "permissionList",
        data() {
            return {
                uidNumber:'',
                plat:[],
                form:{
                    user:'',
                    platform:[],
                    role:{}
                },
                checkList:{},
                formLabelWidth: '70px',
                dialogFormVisible:false,
                roleName:'',
                platLine:'',
                platform:[],
                platformContainer:[],
                platAll:[],
                editRolePlatForm:[],
            }
        },
        methods: {
            getPlatList(){
                getUserList().then(e=>{
                    if(e.data.code === 0){
                        this.platform =this.platformContainer =  e.data.msg;
                    }else{
                        this.$message.error(e.data.msg)
                    }
                })
            },
            dialogFormVisibles(){
                var temList = {};
                this.checkList = Object.assign({},this.editRolePlatForm,this.checkList);
                for(let tem in this.checkList){
                    if(this.checkList[tem] !== 3){
                        temList[tem] = this.checkList[tem];
                    }
                }
                this.checkList = temList;
                this.dialogFormVisible = false;
                var temp = {};
                var ptFlag = [];
                this.platAll.map((item,index)=>{
                    for(let it in this.checkList){
                        if(item['name'] == it){
                            ptFlag.push(Number(item['id']))
                            temp[(item['id'])] = this.checkList[it]
                        }
                    }
                })
                getUserAuthorise({
                    role:JSON.stringify(temp),
                    platform:JSON.stringify(ptFlag),
                    UidNumber: this.uidNumber
                }).then(e=>{
                    if(e.data.code == 0){
                        this.getPlatList();
                        this.$message({message: e.data.msg,type: 'success'})
                    }else{
                        this.$message.error(e.data.msg)
                    }
                })
            },
            edit(self){
                var tempCheckList = {};
                if(this.plat&&this.plat.length){
                    this.plat.map(item=>{
                        if(JSON.stringify(self.role) == "{}"){
                            tempCheckList[item.platform_name] = 3
                        }else{
                            for(let it in self.role){
                                if(it == item.platform_name){
                                    tempCheckList[item.platform_name] = self.role[it]
                                }else{
                                    if(item&&!tempCheckList[item.platform_name]){
                                        tempCheckList[item.platform_name] = 3
                                    }
                                }
                            }
                        }
                    })
                }
                this.checkList = tempCheckList;
                this.uidNumber = self.uidNumber;
                this.dialogFormVisible = true;
                this.form = self;
                this.editRolePlatForm = self.role;
            },
            seachCondition(){
                if(this.roleName == ''){
                    this.platformContainer = this.platform;
                }else{
                    this.platformContainer = this.platform.filter(item=>{
                        return (item.name.toLowerCase().replace(/\s*/g,"")).indexOf(this.roleName.toLowerCase().replace(/\s*/g,""))>-1
                    })
                }
            },
            seachPlatLine(){
                if(this.platLine == ''){
                    this.platformContainer = this.platform;
                }else{
                    this.platformContainer = this.platform.filter(item=>{
                        return (item.platform.some(x=>(Object.values(x).join('')).indexOf(this.platLine)>-1))
                    })
                }
            },
            dateFormat(row, column) {
                let date = row[column.property];
                if (date === undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            init(){
                this.getPlatList();
                getUserManager().then(e=>{
                    if(e.data.code === 0){
                        this.plat = e.data.platform;
                        this.platAll = e.data.all_platform;
                    }else{
                        this.$message.error(e.data.msg)
                    }
                })
            }
        },
        created() {
        },
        mounted() {
            this.init();
        }
    }
</script>

<style scoped>
    .block {
        float: right;
        margin-top: 15px;
    }
</style>
