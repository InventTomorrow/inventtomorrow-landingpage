import test from 'node:test';
import assert from 'node:assert/strict';
import { TIMELINE_MILESTONES, getTimelineProgressPercent } from './timeline';

test('TIMELINE_MILESTONES contains the 3 exact stages from design', () => {
  assert.equal(TIMELINE_MILESTONES.length, 3);
  assert.equal(TIMELINE_MILESTONES[0].time, '2:14');
  assert.equal(TIMELINE_MILESTONES[0].description, 'Your phone rings. Your hands are full.');
  assert.equal(TIMELINE_MILESTONES[1].time, '2:14');
  assert.equal(TIMELINE_MILESTONES[1].description, 'They get a text from your business within seconds.');
  assert.equal(TIMELINE_MILESTONES[2].time, '2:20');
  assert.equal(TIMELINE_MILESTONES[2].description, "They've told us what they need and when. It's waiting for you after the clean.");
});

test('getTimelineProgressPercent calculates correct step progression', () => {
  assert.equal(getTimelineProgressPercent(0, 3), 0);
  assert.equal(getTimelineProgressPercent(1, 3), 50);
  assert.equal(getTimelineProgressPercent(2, 3), 100);
});
