import request from '@/utils/request'

// 获取会议室时间组
export function meetingUsedTime(data) {
  return request({
    url: '/flow/common/usedTime',
    method: 'post',
    data: data,
  })
}
// 流程下拉框
export function flowOption() {
  return request({
    url: '/base/flowOption',
    method: 'get',
  })
}
// 我的发起的流程
export function pushProcess(id,query) {
  return request({
    url: '/base/start/'+id,
    method: 'post',
    data: query
  })
}
export function flowRecord(id) {
  return request({
    url: '/base/flowRecord/'+id,
    method: 'get',
  })
}
export function delRecord(id) {
  return request({
    url: '/base/delete/'+id,
    method: 'get',
  })
}
export function getForm(id) {
  return request({
    url: '/base/getForm/'+id,
    method: 'get',
  })
}
export function diagram(id) {
  return request({
    url: '/flowable/task/diagram/'+id,
    method: 'get',
  })
}
