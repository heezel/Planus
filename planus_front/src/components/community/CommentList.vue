<template>
  <div>
    <div class="writeCommentDiv" v-if="isLogin">
      <v-textarea
        v-model="commentInput"
        counter="200"
        placeholder="댓글을 입력하세요"
        outlined
        auto-grow
        height="100"
        color="#4a8072"
      ></v-textarea>
      <v-btn class="addCommentBtn" @click="goComment()">입력</v-btn>
    </div>
    <div v-for="(comment, i) in commentList" :key="i">
      <v-row align="center" justify="center">
        <v-col cols="8">
          <div class="commentNameLine">
            <div>
              {{ comment.name }}
              <span style="color: rgb(56, 61, 60, 50%); font-weight: 500">
                ({{ comment.regDate.split("T")[0] }}
                {{ comment.regDate.split("T")[1].split(".")[0] }})
              </span>
            </div>
            <div v-if="userId == comment.userId">
              <button
                v-if="isEditing == comment.commentId"
                @click="modifyComment(comment.commentId)"
              >
                저장
              </button>
              <button
                v-else
                @click="goEdit(comment.commentId, comment.content)"
              >
                수정
              </button>
              <span> | </span>
              <button
                v-if="userId == comment.userId"
                @click="deleteCommentPop(comment.commentId)"
              >
                삭제
              </button>
            </div>
          </div>
          <v-textarea
            v-model="commentInput2"
            counter="200"
            value="commentInput2"
            outlined
            auto-grow
            color="#4a8072"
            v-if="isEditing == comment.commentId"
          ></v-textarea>
          <span v-else>{{ comment.content }}</span>
        </v-col>
      </v-row>
      <v-divider style="margin: 1% auto; width: 80%"></v-divider>
    </div>
    <v-row justify="center">
      <v-pagination
        v-model="currentPage"
        class="my-4"
        :length="totalPage"
        color="#4a8072"
      ></v-pagination>
    </v-row>
    <v-dialog v-model="dialog" persistent max-width="300">
      <v-card>
        <v-card-title></v-card-title>
        <v-card-text>정말로 삭제하시겠습니까?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn outlined color="#4a8072" @click="dialog = false">취소</v-btn>
          <v-btn outlined color="#ff1744" @click="delComment()">삭제</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="alert" max-width="450">
      <v-card>
        <v-card-title></v-card-title>
        <v-card-text color="white"> 로그인 후 이용해주세요</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="#4a8072" outlined @click="reLoadPage()">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import API from "@/api/RESTAPI";
import jwt_decode from "jwt-decode";

const api = API;
export default {
  components: {},
  props: {
    articleId: Number,
    isLogin: Boolean,
  },
  data() {
    return {
      nickname: "",
      userId: 0,
      currentPage: 1,
      commentList: [],
      totalPage: 0,
      commentInput: "",
      commentInput2: "",
      isEditing: 0,
      delCommentId: 0,
      dialog: false,
      alert: false,
    };
  },
  async created() {
    this.decoding();
    await this.getCommentList(1);
  },
  watch: {
    currentPage(newVal) {
      this.getCommentList(newVal);
    },
    isLogin() {
      this.decoding();
    },
  },
  methods: {
    async addComment() {
      if (this.commentInput.length > 0 && this.commentInput.length <= 200) {
        this.res = await api.addComment(this.articleId, this.commentInput);
        this.commentInput = "";
      } else {
        window.alert("댓글은 1자 이상 200자 이하로 적어주세요!");
      }
    },
    async modifyComment(commentId) {
      if (this.commentInput2.length > 0 && this.commentInput2.length <= 200) {
        this.res = await api.modifyComment(commentId, this.commentInput2);
        this.commentInput2 = "";
        this.isEditing = 0;
        this.getCommentList(this.currentPage);
      } else {
        window.alert("댓글은 1자 이상 200자 이하로 적어주세요!");
      }
    },
    async getCommentList(page) {
      this.res = await api.getArticleComment(this.articleId, page - 1);
      this.commentList = this.res.commentPage.commentList;
      this.totalPage = this.res.commentPage.totalPage;
    },
    async delComment() {
      this.res = await api.delComment(this.delCommentId);
      this.dialog = false;
      await this.getCommentList(1);
    },
    decoding() {
      let token = this.$cookies.get("token");
      if (token) {
        let decode = jwt_decode(token);
        this.nickname = decode.nickname;
        this.userId = decode.userId;
      } else {
        this.nickname = "";
        this.userId = 0;
      }
    },
    goEdit(commentId, content) {
      if (this.isLogin) {
        this.isEditing = commentId;
        this.commentInput2 = content;
      } else {
        this.alert = true;
      }
    },
    deleteCommentPop(commentId) {
      if (this.isLogin) {
        this.dialog = true;
        this.delCommentId = commentId;
      } else {
        this.alert = true;
      }
    },
    async goComment() {
      if (this.isLogin) {
        await this.addComment();
        this.getCommentList(1);
      } else {
        this.alert = true;
      }
    },
    reLoadPage() {
      this.alert = false;
      this.$router.go();
    },
  },
};
</script>

<style>
.addCommentBtn {
  height: 100px !important;
  margin: 0 0 30px 10px;
  background-color: #4a8072 !important;
  font-size: 1.2rem !important;
  font-weight: 700;
  color: white !important;
}
.commentNameLine {
  display: flex;
  justify-content: space-between;
  color: #383d3c;
  font-weight: 600;
}
.writeCommentDiv {
  width: 70%;
  margin: 0 auto;
  display: flex;
  align-items: center;
}
</style>
