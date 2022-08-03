var $modalContainer = document.querySelector('.modal-container');
var $daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var $entryTime = $modalContainer.querySelector('[name="entryTime"]');
var $daysContainer = document.querySelector('.days-container');
var $dayOfWeek = $modalContainer.querySelector('[name="dayOfWeek"]');
var $modalEntry = $modalContainer.querySelector('.modal-entry-div');
var $entryForm = $modalContainer.querySelector('.entry-form-container');
var $viewContainer = document.querySelector('.container');
var $addButton = $viewContainer.getElementsByClassName('entry-button')[0];
var $scheduleDiv = $viewContainer.getElementsByClassName('schedule-div')[0];
var $scheduleBody = $viewContainer.getElementsByClassName('tbody')[0];
var $weekDay = $viewContainer.querySelector('[id="weekDay"');
var $modalDelete = $modalContainer.querySelector('.modal-delete-div');
var $selectEntry = null;

// dynamically create the days of the week divs
var $newDayContainer = null;
var $newDay = null;
var $numEntries = null;
for (var i = 0; i < $daysOfTheWeek.length; i++) {
  $newDayContainer = document.createElement('div');
  $newDay = document.createElement('div');
  $numEntries = document.createElement('div');
  $newDay.classList.add('day-of-week');
  $newDay.setAttribute('data-day-of-week', $daysOfTheWeek[i]);
  $newDay.innerText = $daysOfTheWeek[i];
  $newDayContainer.appendChild($newDay);
  $newDayContainer.appendChild($numEntries);
  $numEntries.classList.add('num-entries');
  $numEntries.innerHTML = '<span class="entry-float">' + entriesPerDay($daysOfTheWeek[i]) + '</span>';
  $newDayContainer.classList.add('day-container');
  $daysContainer.appendChild($newDayContainer);
}
// dynamically add options to select entry for Day of the Week input
for (i = 0; i < $daysOfTheWeek.length; i++) {
  var $option = document.createElement('option');
  $option.setAttribute('value', $daysOfTheWeek[i]);
  $option.innerText = $daysOfTheWeek[i];
  $dayOfWeek.append($option);
}
// dynamically add options to select entry for Time input
for (var $hours = 0; $hours < 24; $hours++) { // the interval for hours is '1'
  for (var $mins = 0; $mins < 60; $mins += 30) { // the interval for mins is '30'
    var $optionTime = document.createElement('option');
    if ($mins === 0) {
      $optionTime.setAttribute('value', $hours + ':' + '00');
      $optionTime.innerText = $hours + ':' + '00';
    } else {
      $optionTime.setAttribute('value', $hours + ':' + $mins);
      $optionTime.innerText = $hours + ':' + $mins;
    }
    $entryTime.append($optionTime);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // set default day of the week to Monday on page load
  if (scheduleData.nextEntryId > 1) {
    $weekDay.innerText = 'Monday';
    resetDaysContainer();
    $daysContainer.children[$daysOfTheWeek.indexOf($weekDay.innerText)].classList.add('selected');
  }
  // render the schedule body after sorting the entries time
  if (scheduleData.nextEntryId > 1) {
    $scheduleBody.innerHTML = '';
    scheduleData.entries.sort((a, b) => a.timeNum - b.timeNum);
    for (var i = scheduleData.entries.length - 1; i >= 0; i--) {
      if (scheduleData.entries[i].dayOfWeek === $weekDay.innerText) {
        $scheduleBody.prepend(renderEntry(scheduleData.entries[i]));
      }
    }
    $scheduleDiv.classList.remove('hidden');
  } else if (scheduleData.nextEntryId === 1) {
    $scheduleBody.innerHTML = '<p class="no-entries">No entries have been recorded.</p>';
  }
});
// event listeners for the daysContainer
$daysContainer.addEventListener('click', function (event) {
  resetDaysContainer();
  if (event.target.classList.contains('day-of-week')) {
    renderScheduleBody(event.target.innerText);
    event.target.parentElement.classList.add('selected');
    $weekDay.innerText = event.target.innerText;
  }
});
// event listeners for the modal container
$modalContainer.addEventListener('click', function (e) {
  if (e.target.matches('div.modal-container')) {
    viewViewForm();
  } else if (e.target.matches('button.submit-button')) {
    e.preventDefault();
    if ($entryForm.elements.dayOfWeek.value !== 'Day of Week' && $entryForm.elements.dayOfWeek.value !== 'Time') {
      if ($modalEntry.getElementsByClassName('entry-header')[0].innerText === 'Add Entry') {
        var newData = {
          entryId: scheduleData.nextEntryId,
          time: $entryForm.elements.entryTime.value,
          dayOfWeek: $entryForm.elements.dayOfWeek.value,
          description: $entryForm.elements.entryDesc.value
        };
        if (scheduleData.nextEntryId === 1) {
          $scheduleBody.innerHTML = '';
          $weekDay.innerText = '';
        }
        newData.dataEntryId = renderEntry(newData).getAttribute('data-entry-id');
        newData.timeNum = convertTime(newData.time);
        scheduleData.entries.unshift(newData);
        scheduleData.nextEntryId++;
        var $day = newData.dayOfWeek;
        renderScheduleBody($day);
        $viewContainer.getElementsByClassName('entry-float')[$daysOfTheWeek.indexOf($day)].innerText = entriesPerDay($day);
        $entryForm.reset();
        viewViewForm();
        $weekDay.innerText = $day;
        resetDaysContainer();
        $daysContainer.children[$daysOfTheWeek.indexOf($weekDay.innerText)].classList.add('selected');
      } else if ($modalEntry.getElementsByClassName('entry-header')[0].innerText === 'Update Entry') {
        var oldDay = $entryForm.elements.dayOfWeek.value;
        if (scheduleData.editing.dayOfWeek !== $entryForm.elements.dayOfWeek.value) {
          oldDay = scheduleData.editing.dayOfWeek;
        }
        scheduleData.editing.dayOfWeek = $entryForm.elements.dayOfWeek.value;
        scheduleData.editing.time = $entryForm.elements.entryTime.value;
        scheduleData.editing.description = $entryForm.elements.entryDesc.value;
        scheduleData.editing.timeNum = convertTime(scheduleData.editing.time);
        const $thisnum = scheduleData.editing.arrayIndex;
        if (scheduleData.entries[$thisnum].entryId === scheduleData.editing.entryId) {
          scheduleData.entries[$thisnum] = scheduleData.editing;
          renderScheduleBody(scheduleData.editing.dayOfWeek);
          $weekDay.innerText = scheduleData.editing.dayOfWeek;
          $viewContainer.getElementsByClassName('entry-float')[$daysOfTheWeek.indexOf(scheduleData.editing.dayOfWeek)].innerText = entriesPerDay(scheduleData.editing.dayOfWeek);
          $viewContainer.getElementsByClassName('entry-float')[$daysOfTheWeek.indexOf(oldDay)].innerText = entriesPerDay(oldDay);
          scheduleData.editing = null;
          $entryForm.reset();
          viewViewForm();
          resetDaysContainer();
          $daysContainer.children[$daysOfTheWeek.indexOf($weekDay.innerText)].classList.add('selected');
        }
      }
      if (scheduleData.editing !== null) {
        scheduleData.editing = null;
      }
      scheduleData.view = 'view-schedule';
    }
  } else if (e.target.matches('button.modal-select-yes')) {
    scheduleData.entries.splice($selectEntry.arrayIndex, 1);
    viewViewForm();
    $viewContainer.getElementsByClassName('entry-float')[$daysOfTheWeek.indexOf($selectEntry.dayOfWeek)].innerText = entriesPerDay($selectEntry.dayOfWeek);
    renderScheduleBody($selectEntry.dayOfWeek);
    $selectEntry = null;
  } else if (e.target.matches('button.modal-select-no')) {
    viewViewForm();
  }
});
// event listeners for the add entry button
$addButton.addEventListener('click', function (e) {
  viewEntryForm();
});
// event listeners for the table body
$scheduleBody.addEventListener('click', function (event) {
  if (event.target.matches('button.update-button')) {
    $modalEntry.getElementsByClassName('entry-header')[0].innerText = 'Update Entry';
    var $tdParent = event.target.parentElement.parentElement;
    var $renderedEntry = event.target.parentElement.parentElement.parentElement;
    var $entry = {
      dataEntryId: $renderedEntry.getAttribute('data-entry-id'),
      time: $renderedEntry.firstChild.innerText,
      description: $tdParent.firstChild.innerText,
      dayOfWeek: $renderedEntry.getAttribute('day-of-week')
    };
    viewEntryForm();
    for (var i = 0; i < scheduleData.entries.length; i++) {
      if (scheduleData.entries[i].dataEntryId === $entry.dataEntryId) {
        scheduleData.editing = scheduleData.entries[i];
        scheduleData.editing.arrayIndex = i;
        break;
      }
    }
    $entryForm.elements.entryTime.value = $entry.time;
    $entryForm.elements.dayOfWeek.value = $entry.dayOfWeek;
    $entryForm.elements.entryDesc.value = $entry.description;
    scheduleData.view = 'entry-form';
  }
  if (event.target.matches('button.delete-button')) {
    $renderedEntry = event.target.parentElement.parentElement.parentElement;
    for (i = 0; i < scheduleData.entries.length; i++) {
      if (scheduleData.entries[i].entryId === Number($renderedEntry.getAttribute('data-entry-id'))) {
        $selectEntry = {
          arrayIndex: i,
          dayOfWeek: scheduleData.entries[i].dayOfWeek
        };
        break;
      }
    }
    viewModalDelete();
  }
});
// view main schedule
function viewViewForm(event) {
  $modalContainer.classList.add('hidden');
  $modalContainer.classList.remove('size-out');
  $modalEntry.classList.add('hidden');
  $modalEntry.classList.remove('modal-position');
  $modalDelete.classList.add('hidden');
  $modalDelete.classList.remove('modal-position');
  $modalEntry.getElementsByClassName('entry-header')[0].innerText = 'Add Entry';
}
// view entry modal
function viewEntryForm() {
  $modalContainer.classList.remove('hidden');
  $modalContainer.classList.add('size-out');
  $modalEntry.classList.remove('hidden');
  $modalEntry.classList.add('modal-position');
  $entryForm.reset();
}

/*
<table class="table-style">
  <caption class="table-header">Schedule Events for </caption>
  <thead>
    <tr class="header-row">
      <th>Time</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th></th>
      <td></td>
    </tr>
  </tbody>
</table> */
// render schedule entry
function renderEntry(entry) {
  var $newRow = document.createElement('tr');
  $newRow.setAttribute('data-entry-id', entry.entryId);
  $newRow.setAttribute('day-of-week', entry.dayOfWeek);
  var $timeCol = document.createElement('td');
  var $descCol = document.createElement('td');
  $timeCol.innerText = entry.time;
  $descCol.innerHTML = '<span>' + entry.description + '</span>' + '<span><button type="submit" style="float: right;" class="delete-button">Delete</button></span><span><button type="submit" style="float: right;" class="update-button">Update</button></span>';
  $timeCol.classList.add('col-1');
  $descCol.classList.add('col-2');
  $newRow.appendChild($timeCol);
  $newRow.appendChild($descCol);
  return $newRow;
}
// view delete modal
function viewModalDelete() {
  $modalContainer.classList.remove('hidden');
  $modalContainer.classList.add('size-out');
  $modalDelete.classList.add('modal-position');
  $modalDelete.classList.remove('hidden');
}
/*
  <div class="modal-delete-div hidden">
    <div class="row">
      <h1 class="entry-header">Delete Entry Entry</h1>
    </div>
    <div class="modal-delete-body">
      <p>Are you sure you want to delete this entry?</p>
    </div>
    <div class="row modal-delete-buttons">
      <button type="submit" class="delete-button">Delete</button>
      <button type="submit" class="cancel-button">Cancel</button>
    </div>
  </div>
  */

// convert 24 hour time string to numeric time
function convertTime(time) {
  var $timeArray = time.split(':');
  var $timeNum = Number($timeArray[0]) + (Number($timeArray[1]) / 60);
  return $timeNum;
}
// render table body
function renderScheduleBody(day) {
  $scheduleBody.innerHTML = '';
  scheduleData.entries.sort((a, b) => a.timeNum - b.timeNum);
  for (var i = scheduleData.entries.length - 1; i >= 0; i--) {
    if (scheduleData.entries[i].dayOfWeek === day) {
      var $entry = renderEntry(scheduleData.entries[i]);
      $scheduleBody.prepend($entry);
    } else if (day === '') {
      $entry = renderEntry(scheduleData.entries[i]);
      $scheduleBody.prepend($entry);
    }
  }
  $scheduleDiv.classList.remove('hidden');
}
// reset days container
function resetDaysContainer() {
  for (i = 0; i < $daysContainer.children.length; i++) {
    $daysContainer.children[i].classList.remove('selected');
  }
}

// entries per day
function entriesPerDay(day) {
  var $entries = 0;
  for (var i = 0; i < scheduleData.entries.length; i++) {
    if (scheduleData.entries[i].dayOfWeek === day) {
      $entries++;
    }
  }
  return $entries;
}
