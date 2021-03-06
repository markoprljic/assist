/**
 * Tests for the event handler function which is called when the server sends
 * us a value over the websocket
 */

import * as events from '../../js/helpers/events'
import eventToUi from '../../js/views/event-to-ui'
import * as utils from '../../js/helpers/utilities'

// This function tries to send something to the websocket, so we mock it
events.lib.logEvent = jest.fn()
utils.getTransactionObj = jest.fn(() => true)

const serverEvents = ['txPending', 'txConfirmed', 'txFailed']
const uiMockFunctions = {
  activeTransaction: serverEvents,
  activeContract: serverEvents
}

// mock all the functions in the eventToUi object
for (const key in eventToUi) {
  for (const func in eventToUi[key]) {
    eventToUi[key][func] = jest.fn()
  }
}

test('Calls the correct UI handler function when an event is received from the server', () => {
  // AFAIK there are no other functions which call notification UI events
  let eventObj
  for (const key in uiMockFunctions) {
    for (const func of uiMockFunctions[key]) {
      eventObj = {
        categoryCode: key,
        eventCode: func,
        transaction: { hash: '0x' }
      }
      events.handleEvent(eventObj)
      expect(
        eventToUi[eventObj.categoryCode][eventObj.eventCode]
      ).toHaveBeenCalledTimes(1)
    }
  }
})

test('Logs the event if it has not come from the server', () => {
  let eventObj
  let count = 0
  for (const key in eventToUi) {
    for (const func in eventToUi[key]) {
      // make sure we're not sending any events which could look like they've come from the server
      if (serverEvents.indexOf(func) !== -1) continue
      eventObj = {
        categoryCode: key,
        eventCode: func,
        transaction: { hash: '0x' }
      }
      events.handleEvent(eventObj)
      count++
      expect(events.lib.logEvent).toHaveBeenCalledTimes(count)
    }
  }
})
