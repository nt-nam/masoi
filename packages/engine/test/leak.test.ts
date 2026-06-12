import { describe, expect, it } from 'vitest';
import type { RoleId } from '@masoi/shared';
import { buildView, currentNightStep } from '../src/index.js';
import { advanceUntil, makeGame, mustSubmit, toNight1Step } from './helpers.js';

// Ghế: 0,1=Sói, 2=Tiên tri, 3=Bảo vệ, 4=Phù thủy, 5=Thợ săn, 6,7=Dân
const ROLES: RoleId[] = ['werewolf', 'werewolf', 'seer', 'guard', 'witch', 'hunter', 'villager', 'villager'];

describe('Chống leak qua redacted view (PLAN §11)', () => {
  function midNightState() {
    let s = toNight1Step(makeGame(ROLES), 'seer');
    s = mustSubmit(s, { type: 'seer', seat: 2, target: 0 });
    s = advanceUntil(s, (x) => currentNightStep(x) === 'guard');
    s = mustSubmit(s, { type: 'guard', seat: 3, target: 6 });
    s = advanceUntil(s, (x) => currentNightStep(x) === 'wolves');
    s = mustSubmit(s, { type: 'wolfVote', seat: 0, target: 6 });
    s = mustSubmit(s, { type: 'wolfVote', seat: 1, target: 6 });
    s = advanceUntil(s, (x) => currentNightStep(x) === 'witch');
    return s;
  }

  it('Dân thường: không vai người khác, không bước đêm, không mục tiêu của vai khác', () => {
    const v = buildView(midNightState(), 7);
    const json = JSON.stringify(v);
    expect(v.you?.role).toBe('villager');
    expect(v.phase).toEqual({ kind: 'night' }); // không lộ đang ở bước nào
    expect(v.wolves).toBeUndefined();
    expect(v.seerResults).toBeUndefined();
    expect(v.potions).toBeUndefined();
    expect(v.you?.prompt).toBeNull();
    expect(json).not.toContain('werewolf');
    expect(json).not.toContain('seer'); // không có cả role id lẫn field seerTarget/seerResults
    expect(json).not.toContain('victim');
    expect(json).not.toContain('Target');
  });

  it('Sói: thấy bầy, không thấy kết quả soi / bình thuốc', () => {
    const v = buildView(midNightState(), 0);
    expect(v.wolves).toEqual([0, 1]);
    expect(v.seerResults).toBeUndefined();
    expect(v.potions).toBeUndefined();
  });

  it('Phù thủy ở bước của mình: biết nạn nhân, không biết có được Bảo vệ chặn hay không (O7)', () => {
    const v = buildView(midNightState(), 4);
    expect(v.you?.prompt?.witch?.victim).toBe(6);
    expect(JSON.stringify(v)).not.toContain('guardTarget');
  });

  it('Tiên tri: giữ kết quả các đêm đã soi; người khác không có', () => {
    const v = buildView(midNightState(), 2);
    expect(v.seerResults).toEqual([{ night: 1, seat: 0, isWolf: true }]);
  });

  it('Khán giả ngoài ván: you=null, không thông tin kín', () => {
    const v = buildView(midNightState(), null);
    expect(v.you).toBeNull();
    const json = JSON.stringify(v);
    expect(json).not.toContain('werewolf');
    expect(json).not.toContain('victim');
  });

  it('Người chết KHÔNG được lộ vai khi công bố (Mục 7.1)', () => {
    let s = midNightState();
    s = mustSubmit(s, { type: 'witch', seat: 4, save: false, poisonTarget: 7 });
    s = advanceUntil(s, (x) => x.phase.kind === 'dayAnnounce');
    const v = buildView(s, 7); // chính người chết xem
    expect(v.phase.kind).toBe('dayAnnounce');
    if (v.phase.kind === 'dayAnnounce') {
      for (const d of v.phase.deaths) {
        expect(Object.keys(d).sort()).toEqual(['cause', 'seat']); // chỉ seat + kiểu chết
      }
    }
  });

  it('Kết thúc ván mới lật toàn bộ vai', () => {
    let s = makeGame(ROLES);
    for (const seat of [2, 3, 4, 5, 6]) {
      s = mustSubmit(s, { type: 'leave', seat });
    }
    expect(s.phase.kind).toBe('gameOver');
    const v = buildView(s, 7);
    expect(v.phase.kind).toBe('gameOver');
    if (v.phase.kind === 'gameOver') {
      expect(v.phase.reveal).toHaveLength(8);
      expect(v.phase.reveal.find((r) => r.seat === 0)?.role).toBe('werewolf');
    }
  });
});
