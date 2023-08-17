import { boardService } from '../../services/board.service.js';
import { utilService } from '../../services/util.service.js';
import { photoService } from '../../services/photo.service.js';
export const boardStore = {
  state: {
    boards: [],
    currBoardId: null,
    currTask: null,
    boardBgc: null,
    isLabelTitleShown: false,
    isStartAnimation: false,
    labelSize: {
      height: '8px',
      width: '40px',
    }
  },
  getters: {
    boards(state) {
      if (!state.boards.length) return;
      return JSON.parse(JSON.stringify(state.boards));
    },
    starredBoards(state) {
      if (!state.boards) return;
      var filtered = state.boards.filter((board) => board.isStarred);
      return filtered;
    },
    currBoard(state) {
      if (!state.currBoardId || !state.boards.length) return;
      const board = state.boards.find((b) => b._id === state.currBoardId);
      return JSON.parse(JSON.stringify(board));
    },
    boardMembers(state) {
      const board = state.boards.find(b => b._id === state.currBoardId);
      return board.members;
    },
    currTask(state) {
      if (!state.currTask) return;
      return JSON.parse(JSON.stringify(state.currTask));
    },
    boardLabels(state) {
      if (!state.currBoardId || !state.boards.length) return;
      const board = state.boards.find((b) => b._id === state.currBoardId);
      if (!board.labels || !board.labels.length) return;
      return JSON.parse(JSON.stringify(board.labels));
    },
    boardBgc(state) {
      return state.boardBgc;
    },
    isLabelTitleShown(state) {
      return state.isLabelTitleShown;
    },
    isStartAnimation(state) {
      return state.isStartAnimation;
    },
    labelSize(state) {
      return state.labelSize
    }
  },
  mutations: {
    loadBoards(state, { boards }) {
      state.boards = boards;
    },
    setCurrBoardId(state, { boardId }) {
      state.currBoardId = boardId;
    },
    saveBoard(state, { board }) {
      const boardIdx = state.boards.findIndex((b) => b._id === board._id);
      state.boards.splice(boardIdx, 1, board)
      // state.boards[boardIdx] = board;
    },
    addGroup(state, { savedGroup }) {
      const boardIdx = state.boards.findIndex(
        (b) => b._id === state.currBoardId
      );
      state.boards[boardIdx].groups.push(savedGroup);
    },
    setCurrTask(state, { task, boardIdx, groupIdx, taskIdx }) {
      state.currTask = task;
      state.boards[boardIdx].groups[groupIdx].tasks[taskIdx] = task;
    },
    addTask(state, { task, groupId }) {
      const boardIdx = state.boards.findIndex(
        (b) => b._id === state.currBoardId
      );
      const group = state.boards[boardIdx].groups.find(
        (g) => g._id === groupId
      );
      group.tasks.push(task);
    },
    editGroup(state, { savedGroup, boardId }) {
      const boardIdx = state.boards.findIndex((b) => b._id === boardId);
      const groupIdx = state.boards[boardIdx].groups.findIndex(
        (g) => g._id === savedGroup._id
      );
      state.boards[boardIdx].groups[groupIdx] = savedGroup;
    },
    updateBoard(state, { board }) {
      const boardIdx = state.boards.findIndex((b) => b._id === board._id);
      state.boards[boardIdx] = board;
    },
    addBoard(state, { savedBoard }) {
      state.boards.unshift(savedBoard);
    },
    changeHeaderBgc(state, { bgc, isLight }) {
      state.boardBgc = { bgc, isLight };
    },
    starBoard(state, { boardId }) {
      const board = state.boards.find((b) => b._id === boardId);
      board.isStarred = !board.isStarred;
    },
    deleteGroup(state, { groupId, boardId }) {
      const boardIdx = state.boards.findIndex((b) => b._id === boardId);
      const groupIdx = state.boards[boardIdx].groups.findIndex(
        (g) => g._id === groupId
      );
      state.boards[boardIdx].groups.splice(groupIdx, 1);
    },
    toggleLabel(state) {
      state.isLabelTitleShown = !state.isLabelTitleShown
    },
    toggleLabelText(state) {
      state.isStartAnimation = !state.isStartAnimation
      if (state.isStartAnimation) {
        state.labelSize = {
          width: '55px',
          height: '16px'
        }
      } else {
        state.labelSize = {
          width: '40px',
          height: '8px'
        }

      }
    },
    deleteTask(state, { taskId, groupId, boardId }) {

      const boardIdx = state.boards.findIndex((b) => b._id === boardId);

      const groupIdx = state.boards[boardIdx].groups.findIndex(g => g._id === groupId);

      const taskIdx = state.boards[boardIdx].groups[groupIdx].tasks.findIndex(t => t._id === taskId);

      state.boards[boardIdx].groups[groupIdx].tasks.splice(taskIdx, 1);
      state.currTask = null;
    },
    addCheckedUsers(state, { users }) {
      const boardIdx = state.boards.findIndex(b => {
        return b._id === state.currBoardId
      })
      users.forEach(u => {
        if (state.boards[boardIdx].members.some(m => m._id === u._id)) return
        else state.boards[boardIdx].members.push(u)
      })
    },
    removeUserFromBoard(state, { memberId }) {
      const boardIdx = state.boards.findIndex(b => {
        return b._id === state.currBoardId
      })
      const memberIdx = state.boards[boardIdx].members.findIndex(m => {
        return m._id === memberId
      })
      state.boards[boardIdx].members.splice(memberIdx, 1)
    }
  },
  actions: {
    async loadBoards({ commit, state }) {
      try {
        const boards = await boardService.query();
        commit({ type: 'loadBoards', boards });
      } catch (err) {
        throw err;
      }
    },
    async saveBoard({ commit }, { board }) {
      commit({ type: 'saveBoard', board: board });
      try {
        await boardService.updateBoard(board);
      } catch (err) {
        throw err;
      }
    },
    async addGroup({ commit }, { boardId, groupToAdd }) {
      try {
        const savedGroup = await boardService.saveGroup(boardId, groupToAdd);
        commit({ type: 'addGroup', savedGroup });
      } catch (err) {
        throw err;
      }
    },
    async addBoard({ commit }, { boardToAdd }) {
      try {
        const savedBoard = await boardService.addBoard(
          boardToAdd.title,
          boardToAdd.style
        );
        commit({ type: 'addBoard', savedBoard });
      } catch (err) {
        throw err;
      }
    },
    async starBoard({ commit, state }, { boardId }) {
      try {
        const board = { ...state.boards.find((b) => b._id === boardId) };
        board.isStarred = !board.isStarred;
        await boardService.updateBoard(board);
        commit({ type: 'starBoard', boardId });
      } catch (err) {
        throw err;
      }
    },
    async getTask({ commit }, { taskId, boardId }) {
      try {
        const task = await boardService.getTask(taskId, boardId);
        commit({ type: 'setCurrTask', task });
      } catch (err) { }
    },
    async saveTask({ commit, state }, { task, boardId }) {
      const board = state.boards.find((b) => b._id === boardId);
      const boardIdx = state.boards.findIndex((b) => b._id === boardId);
      const groupId = await boardService.getGroupIdByTaskId(task._id, boardId);
      const group = board.groups.find((g) => g._id === groupId);
      const groupIdx = board.groups.findIndex((g) => g._id === groupId);
      const taskIdx = group.tasks.findIndex((t) => t._id === task._id);
      commit({
        type: 'setCurrTask',
        task: task,
        boardIdx,
        groupIdx,
        taskIdx,
      });
      boardService.saveTask(task, boardId);
    },
    async addTask({ commit }, { task, boardId }) {
      const taskToAdd = await boardService.saveTask(task, boardId);
      commit({ type: 'addTask', task: taskToAdd, groupId: task.groupId });
    },
    async editGroup({ commit }, { groupToEdit, boardId }) {
      commit({ type: 'editGroup', savedGroup: groupToEdit, boardId });
      try {
        const savedGroup = await boardService.saveGroup(boardId, groupToEdit);
      } catch (err) {
        throw err;
      }
    },
    async changeBoardBgc({ commit }, { bgc, boardId }) {
      const board = JSON.parse(
        JSON.stringify(await boardService.getBoardById(boardId))
      );
      delete board.style.backgroundColor;
      delete board.style.photo;
      board.style.backgroundColor = bgc;
      await boardService.updateBoard(board);
      commit({ type: 'updateBoard', board });
    },
    async changeBoardBgp({ commit }, { url, boardId }) {
      const board = JSON.parse(
        JSON.stringify(await boardService.getBoardById(boardId))
      );
      delete board.style.backgroundColor;
      delete board.style.photo;
      board.style.photo = url;
      await boardService.updateBoard(board);
      commit({ type: 'updateBoard', board });
    },
    async addLabel({ commit }, { label, boardId }) {
      const board = await boardService.getBoardById(boardId);

      if (!label._id) {
        label._id = utilService.makeId();
        const idx = board.labels.findIndex((l) => l.color === label.color);
        board.labels.splice(idx, 0, label);
      } else {
        const idx = board.labels.findIndex((l) => l._id === label._id);
        board.labels.splice(idx, 1, label);
      }
      commit({ type: 'saveBoard', board });
      await boardService.updateBoard(board);
    },
    async deleteLabel({ commit }, { labelId, task, boardId }) {
      try {
        if (task.labelIds.includes(labelId)) {
          const labelIdx = task.labelIds.findIndex((id) => id === labelId);
          task.labelIds.splice(labelIdx, 1);
          await boardService.saveTask(task, boardId);
        }
        //delete label from board
        const board = await boardService.getBoardById(boardId);
        const boardLabelIdx = board.labels.findIndex((l) => l._id === labelId);
        board.labels.splice(boardLabelIdx, 1);

        commit({ type: 'saveBoard', board });
        await boardService.updateBoard(board);
      } catch (err) {
        throw err;
      }
    },
    async deleteGroup({ commit }, { groupId, boardId }) {
      try {
        commit({ type: 'deleteGroup', groupId, boardId });
        boardService.removeGroup(boardId, groupId);
      } catch (err) {
        throw err;
      }
    },
    toggleLabelTitle({ commit }) {
      commit({ type: 'toggleLabel' })
      setTimeout(() => {
        commit({ type: 'toggleLabelText' })
      }, 100)
    },
    async deleteTask({ commit }, { taskId, boardId }) {
      try {
        const groupId = await boardService.getGroupIdByTaskId(taskId, boardId);
        commit({ type: 'deleteTask', taskId, groupId, boardId })
        await boardService.removeTask(taskId, boardId);
      } catch (err) {
        throw err
      }
    },
    async attachFile({ state, dispatch }, { file, task }) {
      if (!task.attachments || !task.attachments.length) {
        task.attachments = [];
      }
      const fileToAdd = await photoService.uploadPhoto(file)
      task.attachments.push(fileToAdd)
      // const updatedTask = await boardService.saveTask(task, state.currBoardId);
      dispatch({ type: 'saveTask', task, boardId: state.currBoardId });
    },
    async deleteAttachment({ state, dispatch }, { id, task }) {
      const idx = task.attachments.findIndex(a => a.asset_id === id);
      task.attachments.splice(idx, 1);
      // const updatedTask = await boardService.saveTask(task, state.currBoardId);
      dispatch({ type: 'saveTask', task, boardId: state.currBoardId });
    },
    async setDate({ state, dispatch }, { task, dueDate }) {
      task.dueDate = { ...dueDate };
      // const taskToSave = await boardService.saveTask(task, state.currBoardId);
      dispatch({ type: 'saveTask', task, boardId: state.currBoardId })
    },
    async saveChecklist({ state, dispatch }, { title, task }) {
      if (!task.checklists) task.checklists = [];
      task.checklists.push({
        title,
        _id: utilService.makeId(),
        todos: []
      })
      dispatch({ type: 'saveTask', task, boardId: state.currBoardId })
    },
    async addCheckedUsers({ state, commit }, { users }) {
      await boardService.addMembersToBoard(users, state.currBoardId)
      commit({ type: 'addCheckedUsers', users })
    },
    async convertTodoToTask({ dispatch, state }, { txt, currTask }) {
      const groupId = await boardService.getGroupIdByTaskId(currTask._id, state.currBoardId);
      const task = {
        groupId,
        title: txt
      };
      dispatch({ type: 'addTask', task, boardId: state.currBoardId })
    },
    async removeUserFromBoard({ commit }, { memberId, boardId }) {
      const board = await boardService.removeUserFromBoard(memberId, boardId)
      commit({ type: 'removeUserFromBoard', memberId })
    },
    async addComment({ dispatch, state }, { comment, task }) {
      comment._id = utilService.makeId();
      task.comments.push(comment);
      dispatch({ type: 'saveTask', task, boardId: state.currBoardId })
    },
    async deleteComment({ dispatch, state }, { commentId, task }) {
      const idx = task.comments.findIndex(c => c._id === commentId);
      task.comments.splice(idx, 1);
      dispatch({ type: 'saveTask', task, boardId: state.currBoardId })
    },
    async saveComment({ dispatch, state }, { txt, commentId, task }) {
      const idx = task.comments.findIndex(c => c._id === commentId);
      task.comments[idx].txt = txt;
      dispatch({ type: 'saveTask', task, boardId: state.currBoardId })
    }
  }
}
