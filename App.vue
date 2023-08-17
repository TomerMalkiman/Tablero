<template>
  <section :style="bodyOverflow" class="app-container" ref="appContainer">
    <main-header v-if="!isHomePage" @open-drop="openDrop" />
    <router-view @open-drop="openDrop" />
    <component
      :is="currDropDown"
      v-if="currDropDown"
      @close-drop="closeDrop"
      @open-drop="openDrop"
      v-clickoutside="closeDrop"
    />
  </section>
</template>


<script>
import mainHeader from "./components/main.header.vue";
import createBoardDrop from "./components/create.board.drop.vue";
import recentBoardsDrop from "./components/recent.boards.drop.vue";
import starredBoardsDrop from "./components/starred.boards.drop.vue";
import acountDrop from './components/acount.drop.vue'
import moreDrop from './components/more.drop.vue'
import { socketService } from "./services/socket.service.js";

export default {
  components: {
    createBoardDrop,
    recentBoardsDrop,
    starredBoardsDrop,
    mainHeader,
    acountDrop,
    moreDrop
  },
  emits: ["openDrop", "open-drop"],
  created() {
    this.$store.dispatch({ type: 'getLoggedinUser' })
  },
  data() {
    return {
      currDropDown: null,
      isHomePage: false,
      overflow: 'hidden',
    };
  },
  methods: {
    openDrop(cmp) {
      this.currDropDown = cmp;
    },
    closeDrop() {
      this.currDropDown = null;
    },
  },
  computed: {
    bodyOverflow() {
      return `overflow: ${this.overflow}`
    },
    loggedinUser() {
      return this.$store.getters.loggedinUser
    }
  },
  unmounted() { },
  watch: {
    $route(to, from) {
      if (this.$route.name === 'home' || this.$route.name === 'login') {
        this.isHomePage = true
      } else {
        this.isHomePage = false
      }
      if ((this.$route.name === 'login' || this.$route.name === 'home') && this.loggedinUser) this.$router.push('/board')

      if (this.$route.name === 'home') this.$refs.appContainer.style = " background: linear-gradient(0deg, #fff, #eae6ff 100%);"
      else this.$refs.appContainer.style = " background: white"
    },
    'loggedinUser': {
      async handler() {
        if (this.loggedinUser) {
          this.$router.push('/board')
        }
        else this.$router.push('/')
      }

    }

  },
};
</script>