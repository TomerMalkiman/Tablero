import { utilService } from './util.service.js';
// import { storageService } from './async-storage-service.js';
import { httpService } from './http.service.js';
import { userService } from './user.service.js';
import { socketService } from './socket.service.js';

export const boardService = {
  query,
  getBoardById,
  addBoard,
  updateBoard,
  removeBoard,
  saveGroup,
  removeGroup,
  getGroupIdByTaskId,
  saveTask,
  getTask,
  removeTask,
  addMembersToBoard,
  removeUserFromBoard,
  AddNewUserBoard
};

const KEY = 'board';

// BOARD CRUD

async function query() {
  try {
    const user = await userService.getLoggedinUser();
    const boards = await httpService.get(KEY, user);
    return boards;
  } catch (err) {
    throw err;
  }
}

async function getBoardById(boardId) {
  try {
    // const boards = await query();
    const board = httpService.get(KEY + '/' + boardId);
    return board;
  } catch (err) {
    throw err;
  }
}

async function addBoard(title, style) {
  var user = await userService.getLoggedinUser();
  // user.imgUrl = 'https://icon-library.com/images/member-icon/member-icon-19.jpg';
  const boardToSave = _getEmptyBoard();
  if (user) {
    boardToSave.members.push(user)
    boardToSave.createdBy = user
  } else {
    boardToSave.createdBy = {
      username: 'Admin',
      email: 'Admin@gmail.com',
      imgUrl: 'https://icon-library.com/images/member-icon/member-icon-19.jpg',
    }
    boardToSave.members.push({ _id: "u123", username: 'Guest', imgUrl: 'https://icon-library.com/images/member-icon/member-icon-19.jpg' })
  }
  boardToSave.createdAt = Date.now();
  boardToSave.title = title;
  boardToSave.style = style || {};

  try {
    return await httpService.post(KEY, boardToSave);
  } catch (err) {
    throw err;
  }
}

async function updateBoard(board) {
  try {
    const returnedBoard = await httpService.put(KEY + '/' + board._id, board);
    socketService.emit('board-updated')
    return returnedBoard
  } catch (err) {
    throw err;
  }
}

async function addMembersToBoard(users, boardId) {
  try {
    const board = await getBoardById(boardId)
    users.forEach(u => {
      if (board.members.some(m => m._id === u._id)) return
      else (board.members.push(u))
    })
    return await updateBoard(board)
  } catch (err) {
    throw err
  }
}

async function removeUserFromBoard(memberId, boardId) {
  try {
    const board = await getBoardById(boardId);
    const idx = board.members.findIndex(m => {
      return m._id === memberId
    })
    board.members.splice(idx, 1)
    return await updateBoard(board)
  } catch (err) {
    throw err
  }
}

async function removeBoard(boardId) {
  try {
    return await httpService.remove(KEY + '/' + boardId);
  } catch (err) {
    throw err;
  }
}

// GROUP CRUD

async function saveGroup(boardId, group) {
  try {
    const board = await getBoardById(boardId);
    if (group._id) {
      const idx = board.groups.findIndex((g) => g._id === group._id);
      board.groups[idx] = group;
      await updateBoard(board);
      return group;
    } else {
      const groupToAdd = {
        _id: utilService.makeId(),
        title: group.title,
        tasks: [],
      };
      board.groups.push(groupToAdd);
      await updateBoard(board);
      return groupToAdd;
    }
  } catch (err) {
    throw err;
  }
}

async function removeGroup(boardId, groupId) {
  try {
    const board = await getBoardById(boardId);
    const idx = board.groups.findIndex((g) => g._id === groupId);
    board.groups.splice(idx, 1);
    return await updateBoard(board);
  } catch (err) {
    throw err;
  }
}

// TASK CRUD

async function saveTask(task, boardId) {
  try {
    const board = await getBoardById(boardId);
    if (task._id) {
      const groupId = await getGroupIdByTaskId(task._id, boardId);
      const group = board.groups.find((g) => g._id === groupId);
      const idx = group.tasks.findIndex((t) => t._id === task._id);

      group.tasks[idx] = task;
      await updateBoard(board);
      socketService.emit('task-updated')
      return task;

    } else {
      const group = board.groups.find((g) => g._id === task.groupId);
      const taskToAdd = _createTask(task.title);
      group.tasks.push(taskToAdd);
      await updateBoard(board);
      return taskToAdd;
    }
  } catch (err) {
    throw err;
  }
}

async function getTask(taskId, boardId) {
  const board = await getBoardById(boardId);
  try {
    const group = board.groups.find((g) => {
      const t = g.tasks.find((t) => t._id === taskId);
      if (t) return true;
    });
    if (!group) return;
    const task = group.tasks.find((t) => t._id === taskId);
    return task;
  } catch (err) {
    throw err;
  }
}


async function removeTask(taskId, boardId) {
  try {
    const board = await getBoardById(boardId);
    const group = board.groups.find((g) => {
      const t = g.tasks.find((t) => t._id === taskId);
      if (t) return true;
    });
    if (!group) return;
    const taskIdx = group.tasks.findIndex((t) => t._id === taskId);
    group.tasks.splice(taskIdx, 1);
    return await updateBoard(board);
  } catch (err) {
    throw err;
  }
}

async function getGroupIdByTaskId(taskId, boardId) {
  try {
    const board = await getBoardById(boardId);
    const group = board.groups.find((g) => {
      const task = g.tasks.find((t) => t._id === taskId);
      if (task) return true;
    });
    return group._id;
  } catch (err) {
    throw err;
  }
}

function _getEmptyBoard() {
  return {
    isStarred: false,
    groups: [],
    style: {},
    members: [],
    activities: [],
    labels: [
      {
        _id: utilService.makeId(),
        title: '',
        color: '#61BD4F',
      },
      {
        _id: utilService.makeId(),
        title: '',
        color: '#F2D600',
      },
      {
        _id: utilService.makeId(),
        title: '',
        color: '#FF9F1A',
      },
      {
        _id: utilService.makeId(),
        title: '',
        color: '#EB5A46',
      },
      {
        _id: utilService.makeId(),
        title: '',
        color: '#C377E0',
      },
      {
        _id: utilService.makeId(),
        title: '',
        color: '#0079BF',
      },
    ],
  };
}

function _createTask(title) {
  return {
    title,
    description: '',
    _id: utilService.makeId(),
    createdAt: Date.now(),
    labelIds: [],
    style: {
      color: '',
      isBackground: false,
    },
  };
}

async function AddNewUserBoard() {
  try {

    const user = await userService.getLoggedinUser()
    const board = {
      "isStarred": true,
      "groups": [
        {
          "_id": "bqIL3",
          "title": "We are Tablero",
          "tasks": [
            {
              "title": "Press here to see the description!",
              "description": "Hello!\nWe are Tablero, our site is based on the famous website Trello, and actually is a finish project for a web development course called Coding Academy,\nHope you will like our website!",
              "_id": "ceJ6s",
              "createdAt": 1648802285434.0,
              "labelIds": [
                "B8K9o"
              ],
              "style": {
                "color": "",
                "isBackground": false
              }
            },
            {
              "title": "About us: Ben",
              "description": "Hey, my name is Ben, I am one of the three developers of Tablero.\nI am currently 25 years old, born in Israel, and currently learning how to be a web developer!",
              "_id": "KQWzA",
              "createdAt": 1648802466487.0,
              "labelIds": [],
              "style": {
                "isBackground": true,
                "photo": "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMTM3MDJ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NDg4MDI3NDk&ixlib=rb-1.2.1&q=80&w=1080"
              }
            },
            {
              "title": "About us: Tomer",
              "description": "Hey, my name is Tomer, I am one of the three developers of Tablero.\nI am currently 25 years old, born in Israel, and currently learning how to be a web developer!",
              "_id": "MXIbQ",
              "createdAt": 1648802630036.0,
              "labelIds": [],
              "style": {
                "isBackground": true,
                "photo": "https://images.unsplash.com/photo-1569337042150-c21c85b80a10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMTM3MDJ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NDg4MDI3ODQ&ixlib=rb-1.2.1&q=80&w=1080"
              }
            },
            {
              "title": "About us: Tal",
              "description": "Hey, my name is Tal, I am one of the three developers of Tablero.\nI am currently 23 years old, born in Israel, and currently learning how to be a web developer!",
              "_id": "tKbdt",
              "createdAt": 1648802659198.0,
              "labelIds": [],
              "style": {
                "isBackground": true,
                "photo": "https://images.unsplash.com/photo-1554730501-8dd4db2b18cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMTM3MDJ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NDg4MDI4MzQ&ixlib=rb-1.2.1&q=80&w=1080"
              }
            }
          ]
        },
        {
          "_id": "Vz34z",
          "title": "What can you do?",
          "tasks": [
            {
              "title": "You can add lists of assigments!",
              "description": "You can add lists of assigment and project, you can make them about a big project or even make each list resemble a day",
              "_id": "X5NDr",
              "createdAt": 1648802883509.0,
              "labelIds": [
                "J5cwX"
              ],
              "style": {
                "color": "",
                "isBackground": false
              }
            },
            {
              "title": "You can add tasks to each list!",
              "description": "You can add to every list how many tasks you would like to have, you can have a task which is simple or complicated and use inside options to manage the tasks(due dates, label, checklists, etc..)",
              "_id": "hnZg7",
              "createdAt": 1648802977504.0,
              "labelIds": [
                "AKWkC"
              ],
              "style": {
                "color": "",
                "isBackground": false
              }
            },
            {
              "title": "You can manage your tasks!",
              "description": "- Add description to the task.\n- Add members to each task(only those who are members in your board).\n- Add labels to filter importance / subject or what ever you see fit.\n- Add checklist to more complicated tasks that involve more actions to complete.\n- Add due dates to your tasks to let your colleagues/employees know until when to finish the task.\n- Add attachments of images or cover to add a more descriptive information about the task.\n- Archive a task if it's done , created by accident etc..",
              "_id": "3IcE5",
              "createdAt": 1648803150039.0,
              "labelIds": [
                "60snY"
              ],
              "style": {
                "color": "",
                "isBackground": false
              }
            },
            {
              "title": "Drag to your tasks / lists",
              "description": "You can drag your lists to organize them by order , and even drag tasks between lists.",
              "_id": "CMDwe",
              "createdAt": 1648803490618.0,
              "labelIds": [
                "GQaOp"
              ],
              "style": {
                "color": "",
                "isBackground": false
              }
            },
            {
              "title": "Invite members to your board",
              "description": "You can invite members to your board. Your members can be your employees, friend or family, after they are signed up to our app!\nWhoever you will add will be able to see and update tasks, add lists and this way you will get your project very efficient!",
              "_id": "IHgIH",
              "createdAt": 1648803628093.0,
              "labelIds": [
                "j5zAD"
              ],
              "style": {
                "color": "",
                "isBackground": false
              },
              "memberIds": []
            },
            {
              "title": "Quickly edit tasks",
              "description": "By hovering over a task with your cursor you can press the edit icon and quickly edit your tasks.",
              "_id": "hmMrj",
              "createdAt": 1648803851266.0,
              "labelIds": [
                "X86Hk"
              ],
              "style": {
                "color": "",
                "isBackground": false
              }
            },
            {
              "title": "Change covers",
              "description": "You can change covers to your board, to help you separate boards.",
              "_id": "8bnhH",
              "createdAt": 1648804443303.0,
              "labelIds": [
                "idxKC"
              ],
              "style": {
                "color": "",
                "isBackground": false
              }
            }
          ]
        },
        {
          "_id": "bLROG",
          "title": "What is the purpose of our app?",
          "tasks": [
            {
              "title": "Project managment",
              "description": "Let's say you have a big or even a small project to do, you have a lot of work to be done, but you don't have a place to write down your tasks, or how to organize all the job you have to do, you can simply make yourself a personal/shared board and start writing what needs to be done, by what order, add a due date and a lot more options!",
              "_id": "xIx9i",
              "createdAt": 1648803913661.0,
              "labelIds": [],
              "style": {
                "isBackground": false,
                "photo": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMTM3MDJ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NDg4MDQxNTc&ixlib=rb-1.2.1&q=80&w=1080"
              }
            },
            {
              "title": "Manage your business to maximum efficiency",
              "description": "Let's say you have a business with a few or many employees, a lot of work to assign, a lot of tasks that needs to be done.\nYou can simply make a new board, and start making lists of tasks by category/day or however you like and start assigning members to each task and they can edit the task to let you know if it's complete or start working on the next step of the task.",
              "_id": "KxFWy",
              "createdAt": 1648803969350.0,
              "labelIds": [],
              "style": {
                "isBackground": false,
                "photo": "https://images.unsplash.com/photo-1573496130488-f3bd89d03653?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMTM3MDJ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NDg4MDQzOTA&ixlib=rb-1.2.1&q=80&w=1080"
              }
            },
            {
              "title": "Plan a vacation",
              "description": "So you have a vacation ahead of you, how fun!\nAs you know vacation planning can be difficult and overwhelming, alot of stuff to buy, plan.\nYou can make yourself a vacation board, make lists of what you need to buy, where you want to go on your destination, and all you want to do!",
              "_id": "ZDZtM",
              "createdAt": 1648803974843.0,
              "labelIds": [],
              "style": {
                "isBackground": false,
                "photo": "https://images.unsplash.com/photo-1611043714658-af3e56bc5299?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMTM3MDJ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NDg4MDQ0MTU&ixlib=rb-1.2.1&q=80&w=1080"
              }
            },
            {
              "title": "Help you organize your household tasks",
              "description": "If you are the manager of your household you already know how difficult it is to be organized with all the tasks, cleaning, buying groceries, cooking, etc...\nWe try and make it a simple as possible for you to manage all of these to make you life as simple as possible",
              "_id": "aw9cw",
              "createdAt": 1648804012606.0,
              "labelIds": [],
              "style": {
                "isBackground": false,
                "photo": "https://images.unsplash.com/photo-1631889992085-85e6adc159fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMTM3MDJ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NDg4MDQ2ODQ&ixlib=rb-1.2.1&q=80&w=1080"
              }
            }
          ]
        }
      ],
      "style": {
        "photo": "https://images.unsplash.com/photo-1517480625158-292a09aee755?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMTM3MDJ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NDg3NTMyODY&ixlib=rb-1.2.1&q=80&w=1080"
      },
      "members": [
        user
      ],
      "activities": [],
      "labels": [
        {
          "title": "Members",
          "color": "#61BD4F",
          "_id": "j5zAD"
        },
        {
          "title": "Hello",
          "color": "#61BD4F",
          "_id": "B8K9o"
        },
        {
          "_id": "2Ur26",
          "title": "",
          "color": "#61BD4F"
        },
        {
          "title": "Lists",
          "color": "#F2D600",
          "_id": "J5cwX"
        },
        {
          "_id": "OXILN",
          "title": "",
          "color": "#F2D600"
        },
        {
          "title": "Tasks",
          "color": "#FF9F1A",
          "_id": "AKWkC"
        },
        {
          "_id": "lxDUG",
          "title": "",
          "color": "#FF9F1A"
        },
        {
          "title": "Drag",
          "color": "#EB5A46",
          "_id": "GQaOp"
        },
        {
          "_id": "3UbCS",
          "title": "",
          "color": "#EB5A46"
        },
        {
          "title": "Options",
          "color": "#C377E0",
          "_id": "60snY"
        },
        {
          "_id": "yjYE1",
          "title": "",
          "color": "#C377E0"
        },
        {
          "title": "Quick edit",
          "color": "#0079BF",
          "_id": "X86Hk"
        },
        {
          "title": "Separation",
          "color": "#00c2e0",
          "_id": "idxKC"
        },
        {
          "_id": "utucS",
          "title": "",
          "color": "#0079BF"
        }
      ],
      "createdBy": user,
      "createdAt": Date.now(),
      "title": "Get to know us"
    }
    return await httpService.post(KEY, board);
  } catch (err) {
    throw err
  }
}