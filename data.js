/* exported data */

var scheduleData = {
  view: 'view-schedule',
  daysOfTheWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  entries: [],
  editing: null,
  nextEntryId: 1
};

var previousDataJSON = localStorage.getItem('scheduleData');

if (previousDataJSON !== null) {
  scheduleData = JSON.parse(previousDataJSON);
}

window.addEventListener('beforeunload', function (e) {
  var dataJSON = JSON.stringify(scheduleData);
  localStorage.setItem('scheduleData', dataJSON);
});
