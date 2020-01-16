<template>
    <div class="tools-content">
        <el-row>
            <!--<el-card>-->
                <el-col style="padding-bottom: 15px" :span="2" v-for="(item,index) in toolList" :key="index" :offset="1">
                    <el-card  :body-style="{ padding: '10px' }" shadow="always" style="border: 0;">
                        <img :src="item.src" :title="item.name" class="image" @click="openTool(item)" style="cursor: pointer">
                        <div style="padding-top: 10px;">
                            <span style="padding-left: 5px; font-size: 15px;  cursor: pointer" @click="openTool(item)">{{item.name}}</span>
                        </div>
                    </el-card>
                </el-col>
            <!--</el-card>-->
        </el-row>
    </div>
</template>

<script>
export default {
    name: "externalTool",
    data(){
        return {
            toolList: [
                {
                    url: 'http://10.9.242.58:3000',
                    src: require("../../../static/img/HA.png"),
                    name: 'HA监控',
                },
                {
                    url: 'http://10.9.242.57:8086/',
                    src: require("../../../static/img/SSH.png"),
                    name: 'SSH',
                },
            ]
        }
    },
    methods: {
        openTool(item) {
            window.open(item.url);
        }
    }
};
</script>

<style scoped>
.time {
    font-size: 13px;
    color: #999;
}

.bottom {
    margin-top: 13px;
    line-height: 12px;
}

.button {
    padding: 0;
    float: right;
}

.image {
    width: 100%;
    display: block;
    border-radius: 5px;
}

.clearfix:before,
.clearfix:after {
    display: table;
    content: "";
}

.clearfix:after {
    clear: both;
}
</style>
