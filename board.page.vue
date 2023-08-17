<template>
    <div v-if="board" class="main-board" :style="boardBg">
        <header>
            <board-header
                @board-title-changed="saveBoard"
                @open-menu="openMenu"
                @open-invite="toggleInvite"
            />
        </header>

        <div class="groups-container" :style="linear">
            <Container
                v-if="board.groups.length"
                orientation="horizontal"
                @drop="onDrop"
                class="drag-container"
                drag-handle-selector=".column-drag-handle"
            >
                <Draggable v-for="group in board.groups" :key="group._id">
                    <board-group
                        @group-title-changed="updateGroup"
                        @task-added="addTask"
                        :group="group"
                        :boardId="board._id"
                    />
                </Draggable>
            </Container>
            <div class="add-group" :class="addGroupCondition" :style="isAddGroup ? '' : btnBgc">
                <span
                    v-if="!isAddGroup"
                    :style="textColor"
                    @click="toggleAddGroup"
                >+ Add another list</span>
                <div v-else v-clickoutside="toggleAddGroup">
                    <input
                        ref="addGroup"
                        type="text"
                        v-model="groupToAdd.title"
                        placeholder="Enter list title..."
                        @keyup.enter="addGroup"
                    />
                    <div class="add-group-btns">
                        <button @click="addGroup" class="add-group-btn">Add list</button>
                        <button @click="toggleAddGroup" class="cancel-add-group-btn">
                            <span class="x-icon"></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <invite-members v-if="isAddMemberOpen" :clickPos="invitePos" @close-invite="toggleInvite" />

    <board-menu
        @change-board-bgc="changeBoardBgc"
        @change-board-bgp="changeBoardBgp"
        @close-menu="closeMenu"
        :class="menuStatus"
        :board="board"
        :style="menuDisplay"
    />
    <router-view></router-view>
</template>

<script>
import boardHeader from "../components/board.header.vue"
import boardGroup from "../components/board.group.vue"
import boardMenu from "../components/board.menu.vue"
import { Container, Draggable } from "vue3-smooth-dnd";
import FastAverageColor from 'fast-average-color';
import quickEdit from '../components/quick.edit.vue'
import inviteMembers from '../components/invite.members.vue'

import { socketService } from "../services/socket.service";

export default {
    // props: [''],
    components: {
        boardHeader,
        boardGroup,
        boardMenu,
        Container,
        Draggable,
        quickEdit,
        inviteMembers
    },
    created() {
        this.$store.dispatch('loadBoards')
        const id = this.$route.params.boardId
        this.$store.commit({ type: 'setCurrBoardId', boardId: id })
        socketService.emit('board-entered', id);
        socketService.on('update-board', this.updateBoard);
    },
    data() {
        return {
            isAddGroup: false,
            groupToAdd: { title: '' },
            isMenuOpen: false,
            isAddMemberOpen: false,
            invitePos: null,
            menuDisplay: 'display: none'
        }
    },
    methods: {
        updateBoard() {
            this.$store.dispatch('loadBoards');
        },
        saveBoard(boardToSave) {
            this.$store.dispatch({ type: 'saveBoard', board: boardToSave })
        },
        addGroup() {
            if (!this.groupToAdd.title) return
            this.$store.dispatch({ type: 'addGroup', boardId: this.board._id, groupToAdd: this.groupToAdd })
            this.groupToAdd = { title: '' }
        },
        toggleAddGroup() {
            if (this.isAddGroup) {
                setTimeout(() => {
                    this.isAddGroup = false
                }, 100)
            } else {
                this.isAddGroup = true
                setTimeout(() => {
                    this.$refs.addGroup.focus();
                }, 100)
            }
        },
        async addTask(task) {
            await this.$store.dispatch({ type: 'addTask', task, boardId: this.board._id })
        },
        updateGroup(groupToEdit) {
            this.$store.dispatch({ type: 'editGroup', groupToEdit, boardId: this.board._id })
        },
        openMenu() {
            this.menuDisplay = 'display:block'
            setTimeout(() => {
                this.isMenuOpen = true
            }, 10)
        },
        changeBoardBgc(bgc) {
            this.$store.dispatch({ type: 'changeBoardBgc', bgc, boardId: this.board._id })
        },
        changeBoardBgp(url) {
            this.$store.dispatch({ type: 'changeBoardBgp', url, boardId: this.board._id })
        },
        closeMenu() {
            this.isMenuOpen = false
            setTimeout(() => {
                this.menuDisplay = 'display:none'
            }, 150)
        },
        onDrop(dropResult) {
            this.board.groups = this.applyDrag(this.board.groups, dropResult);
            this.$store.dispatch({ type: 'saveBoard', board: this.board })
        },
        applyDrag(arr, dragResult) {
            const { removedIndex, addedIndex, payload } = dragResult;

            if (removedIndex === null && addedIndex === null) return arr;
            const result = [...arr];
            let itemToAdd = payload;

            if (removedIndex !== null) {
                itemToAdd = result.splice(removedIndex, 1)[0];
            }
            if (addedIndex !== null) {
                result.splice(addedIndex, 0, itemToAdd);
            }
            return result;
        },
        toggleInvite(clickPos) {
            this.invitePos = clickPos
            this.isAddMemberOpen = !this.isAddMemberOpen
        }
    },
    computed: {
        board() {
            return this.$store.getters.currBoard
        },
        addGroupCondition() {
            return this.isAddGroup ? 'add-group-active' : ''
        },
        boardBg() {
            if (!this.board.style.backgroundColor && !this.board.style.photo) return
            if (this.board.style.backgroundColor) return `background-color: ${this.board.style.backgroundColor}`
            else return `background-image: url('${this.board.style.photo}')`
        },
        menuStatus() {
            return this.isMenuOpen ? 'menu-open' : 'menu-close'
        },
        bgc() {
            return this.$store.getters.boardBgc
        },
        textColor() {
            if (!this.bgc) return
            return this.bgc.isLight ? 'color: #172b4d' : 'color: white'
        },
        btnBgc() {
            if (!this.bgc) return
            return this.bgc.isLight ? 'background-color: #0000001a' : 'background-color: #ffffff3d'
        },
        linear() {
            if (!this.board.style.backgroundColor && !this.board.style.photo) return
            if (this.board.style.backgroundColor) return ``
            if (!this.bgc.isLight) return `background: linear-gradient(180deg, #0000003d 0, #0000003d 48px, #0000 80px, #0000);`
            else return 'background: linear-gradient(rgb(254 245 245 / 24%) 0px, rgb(255 255 255 / 24%) 48px, rgb(255 254 254 / 0%) 80px, rgb(248 248 248 / 0%))'
        }
    },
    watch: {
        'board': {
            async handler() {
                if (this.board.style.photo) {
                    const fac = new FastAverageColor();
                    const color = await fac.getColorAsync(this.board.style.photo);
                    this.$store.commit({ type: 'changeHeaderBgc', bgc: color.rgb, isLight: color.isLight })
                    return
                } else {
                    this.$store.commit({ type: 'changeHeaderBgc', bgc: this.board.style.backgroundColor })
                }
            }
        }
    },
    unmounted() { },
}
</script>