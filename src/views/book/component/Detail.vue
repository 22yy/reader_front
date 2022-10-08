<template>
  <div class="detail">
    <el-form ref="postForm" :model="postForm" class="form-container">
      <Sticky :class-name="'sub-navbar'">
        <el-button v-if="!isedit" @click="showGuide">显示帮助</el-button>
        <el-button 
        v-loading="loading" 
        type="success" 
        @click="submitForm"
        >
          {{isedit ? "编辑电子书" : "新增电子书"}}
        </el-button>
      </Sticky>
      <div class="detail-container">
        <el-row>
          <Warning />
          <!-- 上传组件 -->
          <el-col :span="24">
            <EpubUpload 
            :fileList="fileList"
            :disabled="isedit"
            @onSuccess="onUploadSuccess"
            @onRemove="onUploadRemove"
            />
          </el-col>
          <!-- 电子书表单 -->
          <el-col :span="24">
            <el-form-item prop="title">
              <MDinput  v-model="postForm.title" :maxlength="100" required name="name">书名</MDinput>
            </el-form-item>
            <!-- 书名出版社 -->
            <el-row>
              <el-col :span="12">
                <el-form-item label="作者:" :label-width="labelWidth">
                  <el-input 
                  v-model="postForm.author"
                  placeholder="作者"
                  />
                </el-form-item>
              </el-col>
               <el-col :span="12">
                <el-form-item label="出版社:" :label-width="labelWidth">
                  <el-input 
                  v-model="postForm.publisher"
                  placeholder="出版社"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 语言根文件 -->
             <el-row>
              <el-col :span="12">
                <el-form-item label="语言:" :label-width="labelWidth">
                  <el-input 
                  v-model="postForm.language"
                  placeholder="语言"
                  />
                </el-form-item>
              </el-col>
               <el-col :span="12">
                <el-form-item label="根文件" :label-width="labelWidth">
                  <el-input 
                  v-model="postForm.rootFile"
                  placeholder="根文件"
                  disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 文件路径解压路径 -->
            <el-row>
              <el-col :span="12">
                <el-form-item label="文件路径:" :label-width="labelWidth">
                  <el-input 
                  v-model="postForm.filePath"
                  placeholder="文件路径"
                  disabled
                  />
                </el-form-item>
              </el-col>
               <el-col :span="12">
                <el-form-item label="解压路径:" :label-width="labelWidth">
                  <el-input 
                  v-model="postForm.unzipPath"
                  placeholder="解压路径"
                  disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 封面路径文件名称 -->
            <el-row>
              <el-col :span="12">
               <el-form-item :label-width="labelWidth" label="封面路径：">
                 <el-input
                   v-model="postForm.coverPath"
                   placeholder="封面路径"
                   style="width: 100%"
                   disabled
                  />
               </el-form-item>
             </el-col>
              <el-col :span="12">
               <el-form-item :label-width="labelWidth" label="文件名称：">
                <el-input
                  v-model="postForm.filename"
                  placeholder="文件名称"
                  style="width: 100%"
                  disabled
                />
              </el-form-item>
             </el-col>
            </el-row>
            <!-- 封面图片 -->
            <el-row>
              <el-col :span="24">
                <el-form-item :label-width="labelWidth" label="封面">
                 <a :href="postForm.cover" v-if="postForm.cover" target="_blank">
                    <img :src="postForm.cover" class="preview-img">
                  </a>
                 <span v-else>无</span>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 目录 -->
            <el-row>
              <el-col :span="24">
               <el-form-item :label-width="labelWidth" label="目录">
                <div v-if="postForm.contents && postForm.contents.length" class="contentsWrapper">
                  <el-tree :data="contentsTree" @node-click="onContentClick"/>
                </div>
                <span v-else>无</span>
               </el-form-item>
              </el-col>
            </el-row>

          </el-col>
        </el-row>
      </div>
    </el-form>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky/index.vue";
import Warning from './Warning'
import EpubUpload from "@/components/EpubUpload/index.vue";
import MDinput from "@/components/MDinput/index.vue";

const defaultForm = {
    title: '', // 书名
    author: '', // 作者
    publisher: '', // 出版社
    language: '', // 语种
    rootFile: '', // 根文件路径
    cover: '', // 封面图片URL
    coverPath: '', // 封面图片路径
    fileName: '', // 文件名
    originalName: '', // 文件原始名称
    filePath: '', // 文件所在路径
    unzipPath: '', // 解压文件所在路径
    contents: [] // 目录
  }

export default {
  name: "Detail",
  props: {
    isedit: Boolean,
  },
  data() {
    return {
      loading: false,
      postForm: {
       
      },
      fileList:[],
      labelWidth:'120px',
      contentsTree:[],
      rules:{
        title:[{


        }]
      }
    };
  },
  components: { Sticky, Warning, EpubUpload, MDinput },
  methods: {
    toDefault() {
      this.postForm = Object.assign({},this.defaultForm)
    },
    setData(data) {
      const {
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        url,
        originalname,
        filename,
        coverPath,
        filePath,
        unzipPath,
        contents,
        contentsTree
      }=data
      this.postForm = {
        ...this.postForm,
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        url,
        originalname,
        filename,
        coverPath,
        filePath,
        unzipPath,
        contents,
      }
     this.contentsTree = contentsTree
    },
    //点击目录跳转
    onContentClick(data){
    const {text} = data
      if(text) {
       window.open(text)
      }
    },
    showGuide() {
      console.log('Guide');
    },
    submitForm() {
    },
    onUploadSuccess(data) {
      this.setData(data)
    },
    onUploadRemove() {
      this.toDefault()
    }
  },
};
</script>

<style  scoped lang="scss">
  @import "~@/styles/mixin.scss";
 .detail{
  position: relative;
  .detail-container{
     padding: 40px 45px 20px 50px;
  }

 }

</style>
