<template>
    <div id="content">
      <el-card class="note-warpper">
        <div slot="header" class="note-header">
          <span>Release Notes</span>
        </div>
        <pre class="notes">{{content}}</pre>
      </el-card>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        name: "releaseNote",
        data(){
            return {
                content: ''
            }
        },
        mounted() {
            this.getContent();
        },
        beforeRouteLeave (to, from, next) {
            if(to.path != "/dashboard"){
                !this.$store.state.app.sidebar.opened&&this.$store.dispatch('app/toggleSideBar')
            }
            next();
        },
        methods:{
            getContent(){
                let self = this;
                axios.get('/release notes').then(function (res) {
                    self.content = res.data;
                })
            }
        }
    }
</script>

<style scoped>
  .note-warpper{
    width: 80%;
    margin: 0 10%;
  }
  .note-header{
    font-weight: bold;
    font-size: 18px;
    font-family: DIN-Black;
    text-align: center;
  }
  .notes{
    width: 60%;
    line-height: 25px;
    margin: 0 20%;
  }
</style>
