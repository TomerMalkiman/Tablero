<template>
  <section class="boards-page">
    <!-- <div class="boards-page-nav"></div> -->
    <hompage-nav />

    <div class="all-boards">
      <div v-if="starredBoards.length" class="starred-boards-container">
        <div class="starred-boards-title">
          <span class="member-icon"></span>
          <h3 class="starred-header">Starred boards</h3>
        </div>
        <div class="starred-boards-list-container">
          <ul class="starred-boards-list">
            <li class="board-card" v-for="board in starredBoards" :key="board._id">
              <router-link
                class="board-link"
                :to="'/board/' + board._id"
                :style="cardBG(board.style)"
              >
                <span class="link-block"></span>
                <div class="board-card-details">
                  <div class="card-header-name">{{ board.title }}</div>
                  <div class="card-star">
                    <span @click.prevent="starBoard(board._id)" class="card-star-container">
                      <span class="star"></span>
                    </span>
                  </div>
                </div>
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="boards.length" class="your-boards-container">
        <div class="your-boards-title">
          <div class="member-icon"></div>
          <h3 class="your-boards-header">Your boards</h3>
        </div>
        <div class="your-boards-list-container">
          <ul class="your-boards-list">
            <li class="board-card" v-for="board in boards" :key="board._id">
              <router-link
                class="board-link"
                :to="'/board/' + board._id"
                :style="cardBG(board.style)"
              >
                <span class="link-block"></span>
                <div class="board-card-details">
                  <div class="card-header-name">{{ board.title }}</div>
                  <div class="card-star">
                    <span @click.prevent="starBoard(board._id)" class="card-star-container">
                      <span class="star"></span>
                    </span>
                  </div>
                </div>
              </router-link>
            </li>
            <li class="create-new-board-card" @click="openDropdown('createBoardDrop')">
              <div class="new-board-card">
                <p>
                  <span>Create new board</span>
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import boardPreview from "../components/board.preview.vue";
import hompageNav from "../components/homepage.nav.vue";
import { userService } from "../services/user.service.js";

export default {
  emits: ["openDrop", "open-drop"],
  components: {
    boardPreview,
    hompageNav,
  },
  created() {
    this.$store.dispatch({ type: "getLoggedinUser" });
    this.$store.dispatch({ type: "loadBoards" });
    this.$store.commit({ type: "setCurrBoardId", boardId: null });
    this.$store.commit({ type: "changeHeaderBgc", bgc: "#026aa7" });
  },
  data() {
    return {};
  },
  methods: {
    openDropdown(cmpName) {
      this.$emit("open-drop", cmpName);
    },
    async starBoard(boardId) {
      await this.$store.dispatch({
        type: "starBoard",
        boardId,
      });
    },
  },
  computed: {
    boards() {
      return this.$store.getters.boards || [];
    },
    starredBoards() {
      return this.$store.getters.starredBoards || [];
    },
    cardBG() {
      return (style) => {
        if (style.photo) return `background-image: url(${style.photo})`;
        else if (style.backgroundColor)
          return `background-color: ${style.backgroundColor}`;
        else return "background-color: #0079bf";
      };
    },
    loggedinUser() {
      return this.$store.getters.loggedinUser;
    },
  },
  unmounted() { },
  watch: {
    loggedinUser: {
      handler() {
        this.$store.dispatch({ type: "loadBoards" });
      },
    },
  },
};
</script>