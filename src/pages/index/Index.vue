<template>
    <div class="index">
        {{msg}}
        <a href="about.html">关于我们</a>
        <a href="list.html">列表 </a>
    </div>
</template>
<script>
    export default {
        name:'index',
        data(){
            return {
                msg:'这是一个首页'
            }
        }
    }
</script>
