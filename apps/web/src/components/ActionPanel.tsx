import type { RedactedView } from '@masoi/shared';

interface Props {
  view: RedactedView;
  /** Phù thủy: đang ở chế độ chọn người để độc. */
  poisonMode: boolean;
  poisonPick: number | null;
  witchSave: boolean;
  onWitchToggleSave: () => void;
  onPoisonMode: (on: boolean) => void;
  onWitchConfirm: () => void;
  onSpeakDone: () => void;
  onVoteMercy: () => void;
  onHunterSkip: () => void;
}

const nameOf = (view: RedactedView, seat: number | null | undefined) =>
  seat == null ? null : (view.players[seat]?.name ?? '???');

export function ActionPanel(props: Props) {
  const { view } = props;
  const me = view.you;
  const phase = view.phase;

  // Khán giả / người chết
  if (!me || !me.alive) {
    if (phase.kind === 'gameOver') return null;
    return (
      <Panel>
        <p className="text-sm" style={{ color: 'var(--ink-dim)' }}>
          👻 Bạn đang ở chế độ khán giả — theo dõi và trò chuyện trong kênh Người chết.
        </p>
      </Panel>
    );
  }

  const prompt = me.prompt;

  if (phase.kind === 'roleReveal') {
    return (
      <Panel>
        <p className="text-sm">🎴 Hãy xem kỹ lá bài vai của bạn. Ván sẽ bắt đầu ngay…</p>
      </Panel>
    );
  }

  if (phase.kind === 'dayAnnounce') {
    return (
      <Panel>
        {phase.deaths.length === 0 ? (
          <p className="text-sm">🌅 {view.dayNumber === 1 ? 'Ngày đầu tiên — làm quen và dò xét. Hôm nay không treo cổ.' : 'Đêm qua bình yên, không ai chết.'}</p>
        ) : (
          <p className="text-sm">
            💀 Đêm qua:{' '}
            <b style={{ color: 'var(--wolf-bright)' }}>
              {phase.deaths.map((d) => nameOf(view, d.seat)).join(', ')}
            </b>{' '}
            đã chết. Vai của họ không được tiết lộ.
          </p>
        )}
      </Panel>
    );
  }

  if (phase.kind === 'hunterShot') {
    if (prompt?.step === 'hunterShoot') {
      return (
        <Panel accent>
          <p className="text-sm font-semibold">🏹 Bạn là Thợ săn và bạn vừa gục xuống!</p>
          <p className="text-sm">Chạm vào một người trên lưới để kéo theo họ — hoặc hạ nòng súng.</p>
          <button className="btn btn-ghost mt-2" onClick={props.onHunterSkip}>
            Không bắn ai
          </button>
        </Panel>
      );
    }
    return (
      <Panel>
        <p className="text-sm">
          🏹 <b>{nameOf(view, phase.hunterSeat)}</b> là Thợ săn! Phát súng cuối cùng đang lên nòng…
        </p>
      </Panel>
    );
  }

  if (phase.kind === 'night') {
    if (!prompt) {
      return (
        <Panel>
          <p className="text-sm" style={{ color: 'var(--ink-dim)' }}>
            🌙 Màn đêm bao trùm. Hãy chờ tới lượt của bạn…
          </p>
        </Panel>
      );
    }
    switch (prompt.step) {
      case 'seer':
        return (
          <Panel accent>
            <p className="text-sm font-semibold">🔮 Tới lượt Tiên tri</p>
            {prompt.chosen != null ? (
              <SeerResult view={view} />
            ) : (
              <p className="text-sm">Chạm vào một người để soi — bạn sẽ biết kín họ có phải Sói không. Chỉ soi được MỘT lần mỗi đêm.</p>
            )}
          </Panel>
        );
      case 'guard':
        return (
          <Panel accent>
            <p className="text-sm font-semibold">🛡️ Tới lượt Bảo vệ</p>
            <p className="text-sm">
              {prompt.chosen != null
                ? `Đang bảo vệ ${nameOf(view, prompt.chosen)} đêm nay. Chạm người khác để đổi (tới khi hết giờ).`
                : 'Chạm vào một người để che chở khỏi nanh Sói đêm nay. Không được giữ một người hai đêm liền.'}
            </p>
          </Panel>
        );
      case 'wolves': {
        const votes = Object.entries(prompt.wolfVotes ?? {});
        return (
          <Panel wolf>
            <p className="text-sm font-semibold">🐺 Bầy Sói săn mồi</p>
            <p className="text-sm">
              {prompt.chosen != null
                ? `Bạn đang nhắm ${nameOf(view, prompt.chosen)}. Cả bầy phải thống nhất — hòa phiếu thì đêm nay không ai bị cắn.`
                : 'Chạm vào một người để chọn nạn nhân. Trao đổi với bầy trong kênh Sói.'}
            </p>
            {votes.length > 0 && (
              <p className="text-xs" style={{ color: 'var(--ink-dim)' }}>
                Phiếu bầy: {votes.map(([w, t]) => `${nameOf(view, Number(w))}→${nameOf(view, Number(t))}`).join(' · ')}
              </p>
            )}
          </Panel>
        );
      }
      case 'witch': {
        const w = prompt.witch!;
        return (
          <Panel accent>
            <p className="text-sm font-semibold">🧪 Tới lượt Phù thủy</p>
            <p className="text-sm">
              {w.victim != null ? (
                <>
                  Đêm nay Sói nhắm vào <b style={{ color: 'var(--wolf-bright)' }}>{nameOf(view, w.victim)}</b>.
                </>
              ) : (
                'Đêm nay Sói không cắn được ai.'
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {w.canSave && (
                <button
                  className={`btn ${props.witchSave ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={props.onWitchToggleSave}
                >
                  💚 {props.witchSave ? 'Sẽ cứu' : 'Dùng Bình Cứu'}
                </button>
              )}
              <button
                className={`btn ${props.poisonMode || props.poisonPick != null ? 'btn-danger' : 'btn-ghost'}`}
                disabled={!w.canPoison && props.poisonPick == null}
                onClick={() => props.onPoisonMode(!props.poisonMode)}
              >
                ☠️ {props.poisonPick != null ? `Độc ${nameOf(view, props.poisonPick)}` : props.poisonMode ? 'Chạm người để độc…' : 'Dùng Bình Độc'}
              </button>
              <button className="btn btn-primary" onClick={props.onWitchConfirm}>
                Chốt quyết định
              </button>
            </div>
            <p className="mt-1 text-xs" style={{ color: 'var(--ink-dim)' }}>
              Mỗi bình chỉ dùng một lần cả ván. Không chốt = không dùng gì đêm nay.
            </p>
          </Panel>
        );
      }
      default:
        return null;
    }
  }

  if (phase.kind === 'dayDiscuss') {
    const speaker = phase.currentSpeaker;
    if (prompt?.step === 'speak') {
      return (
        <Panel accent>
          <p className="text-sm font-semibold">🎙️ Tới lượt bạn phát biểu!</p>
          <p className="text-sm">Gõ vào kênh Làng bên dưới. Xong thì bấm nút để nhường lượt.</p>
          <button className="btn btn-primary mt-2" onClick={props.onSpeakDone}>
            Nói xong ✓
          </button>
        </Panel>
      );
    }
    return (
      <Panel>
        <p className="text-sm">
          🗣️ Đang nói: <b style={{ color: 'var(--accent)' }}>{nameOf(view, speaker) ?? '—'}</b>
          {phase.canVoteToday ? ' · Hết lượt nói sẽ biểu quyết.' : ' · Ngày 1 không treo cổ.'}
        </p>
        <p className="text-xs" style={{ color: 'var(--ink-dim)' }}>
          Thứ tự: {phase.speakOrder.map((s) => nameOf(view, s)).join(' → ')}
        </p>
      </Panel>
    );
  }

  if (phase.kind === 'dayVote') {
    const myVote = prompt?.step === 'vote' ? prompt.chosen : null;
    return (
      <Panel accent>
        <p className="text-sm font-semibold">🗳️ Biểu quyết treo cổ</p>
        <p className="text-sm">
          {myVote != null
            ? `Bạn đang bỏ phiếu treo ${nameOf(view, myVote)}. Chạm người khác để đổi.`
            : 'Chạm vào một người để bỏ phiếu, hoặc chọn Tha. Đổi phiếu tự do tới khi hết giờ.'}
        </p>
        <button className="btn btn-ghost mt-2" onClick={props.onVoteMercy}>
          🕊️ Tha — không treo ai
        </button>
      </Panel>
    );
  }

  if (phase.kind === 'voteResult') {
    return (
      <Panel>
        <p className="text-sm font-semibold">
          ⚖️{' '}
          {phase.lynched != null ? (
            <>
              <b style={{ color: 'var(--wolf-bright)' }}>{nameOf(view, phase.lynched)}</b> bị làng treo cổ.
            </>
          ) : (
            'Không ai bị treo (hòa phiếu hoặc "Tha" thắng).'
          )}
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--ink-dim)' }}>
          {phase.ballots
            .map((b) => `${nameOf(view, b.voter)}→${b.target === 'mercy' || b.target === null ? 'Tha' : nameOf(view, b.target)}`)
            .join(' · ')}
        </p>
      </Panel>
    );
  }

  return null;
}

function SeerResult({ view }: { view: RedactedView }) {
  const latest = view.seerResults?.[view.seerResults.length - 1];
  if (!latest || latest.night !== view.nightNumber) return null;
  return (
    <p className="text-sm">
      Kết quả:{' '}
      <b style={{ color: latest.isWolf ? 'var(--wolf-bright)' : 'var(--village)' }}>
        {view.players[latest.seat]?.name} {latest.isWolf ? 'LÀ MA SÓI 🐺' : 'không phải Sói 🌿'}
      </b>
    </p>
  );
}

function Panel({ children, accent, wolf }: { children: React.ReactNode; accent?: boolean; wolf?: boolean }) {
  return (
    <div
      className="panel rise-in px-4 py-3"
      style={{
        borderColor: wolf ? 'rgba(224,69,78,0.5)' : accent ? 'rgba(232,180,79,0.45)' : undefined,
        boxShadow: accent ? '0 0 24px -8px rgba(232,180,79,0.45)' : wolf ? '0 0 24px -8px rgba(224,69,78,0.5)' : undefined,
      }}
    >
      {children}
    </div>
  );
}
