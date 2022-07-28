import { getDicts } from "@/api/system/dict/data";

const state = {
  meetingRoomIdOptions: null,
}

const mutations = {
  SET_MEETINGROOM: (state, data) => {
    state.meetingRoomIdOptions = data
  },
}

const actions = {
  // 获取会议室字典信息
  setMeetingRoom({ commit }) {
    if (!state.meetingRoomIdOptions) {
      console.log('执行');
      getDicts("sys_meeting_room").then((response) => {
        commit('SET_MEETINGROOM', response.data)
      });
    }
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

