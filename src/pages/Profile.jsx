import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  User, Trophy, Music, Calendar, BarChart3, Clock, CheckCircle,
  Star, Settings, Edit3, Image, ShieldAlert, Sparkles, Award
} from 'lucide-react';
import { useAnalyticsStore } from '../store/analyticsStore';
import { getUnlockedTrophies, TROPHY_TIERS } from '../engine/TrophyEngine';
import { useAppStore } from '../store/appStore';
import { useToast } from '../components/ui/Toast';

export default function Profile() {
  const { addToast } = useToast();
  const { theme, setTheme } = useAppStore();
  
  // Connect to actual analytics store data
  const {
    totalMatches,
    totalSongsPlayed,
    languageStats,
    artistStats,
    movieStats,
    teamStats,
    matchHistory
  } = useAnalyticsStore();

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: 'BollyMaster_99',
    title: 'Grandmaster Champion',
    bio: 'Dedicated Antyakshari competitor. Lover of 90s Bollywood classics and fast-paced speed rounds.',
    avatar: '🎤',
    bannerGradient: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)'
  });

  // Theme presets
  const themes = [
    { id: 'dark', name: 'Deep Space', gradient: 'linear-gradient(135deg, #1e1b4b 0%, #09090b 100%)', color: '#7c3aed' },
    { id: 'gold', name: 'Royal Gold', gradient: 'linear-gradient(135deg, #451a03 0%, #09090b 100%)', color: '#f59e0b' },
    { id: 'rose', name: 'Neon Rose', gradient: 'linear-gradient(135deg, #4c0519 0%, #09090b 100%)', color: '#f43f5e' },
    { id: 'emerald', name: 'Cyber Mint', gradient: 'linear-gradient(135deg, #022c22 0%, #09090b 100%)', color: '#10b981' }
  ];

  // Calculate actual user stats or fallback to realistic mock if first visit
  const stats = useMemo(() => {
    const hasData = totalMatches > 0;
    
    // Sum wins across all team identities
    let actualWins = 0;
    let actualLosses = 0;
    let totalScore = 0;
    let avgResponse = 0;
    let totalTurnsCount = 0;

    Object.values(teamStats).forEach(t => {
      actualWins += t.wins || 0;
      actualLosses += t.losses || 0;
      totalScore += t.totalScore || 0;
      if (t.avgResponseTime) {
        avgResponse += t.avgResponseTime;
        totalTurnsCount++;
      }
    });

    const wins = hasData ? actualWins : 8;
    const losses = hasData ? actualLosses : 3;
    const totalSongs = hasData ? totalSongsPlayed : 142;
    const accuracy = hasData ? Math.round((totalSongs / (totalSongs + actualLosses * 2)) * 100) : 89;
    const avgResponseTime = hasData && totalTurnsCount > 0 ? Math.round(avgResponse / totalTurnsCount) : 11;
    const totalViolations = hasData ? actualLosses : 1;

    // Unlocked trophies
    const profileStats = { wins, accuracy, totalViolations, avgResponseTime };
    const unlockedTrophies = getUnlockedTrophies(profileStats);

    // Favorite Language
    const topLanguages = Object.entries(languageStats).sort((a,b)=>b[1]-a[1]);
    const favLang = topLanguages.length > 0 ? topLanguages[0][0] : 'Hindi';
    
    // Favorite Artist
    const topArtists = Object.entries(artistStats).sort((a,b)=>b[1]-a[1]);
    const favArtist = topArtists.length > 0 ? topArtists[0][0] : 'Arijit Singh';

    // Favorite Movie
    const topMovies = Object.entries(movieStats).sort((a,b)=>b[1]-a[1]);
    const favMovie = topMovies.length > 0 ? topMovies[0][0] : 'Dilwale Dulhania Le Jayenge';

    return {
      matchesPlayed: wins + losses,
      wins,
      losses,
      accuracy,
      totalSongs,
      avgResponseTime,
      unlockedTrophies,
      favLang,
      favArtist,
      favMovie,
      totalViolations
    };
  }, [totalMatches, totalSongsPlayed, teamStats, languageStats, artistStats, movieStats]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsEditing(false);
    addToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your personal settings have been successfully updated.'
    });
  };

  const handleThemeChange = (themeId) => {
    setTheme(themeId);
    addToast({
      type: 'info',
      title: 'Theme Customized',
      message: 'Active profile visual aesthetics adjusted.'
    });
  };

  const displayHistory = useMemo(() => {
    if (matchHistory.length > 0) {
      return matchHistory.map(m => ({
        id: m.matchId,
        rounds: m.rounds,
        songs: m.totalSongs,
        result: m.winnerId ? 'Victory' : 'Defeat',
        date: new Date(m.timestamp).toLocaleDateString(),
        mode: m.gameMode
      }));
    }
    // Demo history
    return [
      { id: 'match_1', rounds: 5, songs: 24, result: 'Victory', date: '06/02/2026', mode: 'classic' },
      { id: 'match_2', rounds: 8, songs: 38, result: 'Victory', date: '05/29/2026', mode: 'speed' },
      { id: 'match_3', rounds: 5, songs: 18, result: 'Defeat', date: '05/20/2026', mode: 'elimination' }
    ];
  }, [matchHistory]);

  return (
    <div className="page">
      <div className="container" style={{ paddingBottom: 'var(--space-12)' }}>
        
        {/* Profile Card Banner Header */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--space-6)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ height: '140px', background: profile.bannerGradient, position: 'relative' }}>
            <span style={{ position: 'absolute', top: 16, right: 16, display: 'inline-flex' }} className="badge badge-primary">
              <Sparkles size={12} style={{ marginRight: 4 }} /> {profile.title}
            </span>
          </div>

          <div style={{ padding: 'var(--space-6)', position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Avatar block */}
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '45px',
              border: '4px solid var(--bg-secondary)',
              background: 'var(--surface-2)',
              fontSize: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '-65px',
              boxShadow: 'var(--shadow-lg)'
            }}>
              {profile.avatar}
            </div>

            {/* Profile editable fields */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="grid grid-3 gap-4">
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Avatar Emoji</label>
                    <input className="input" value={profile.avatar} onChange={e => setProfile({...profile, avatar: e.target.value})} maxLength={2} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Username</label>
                    <input className="input" value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Short Title Badge</label>
                  <input className="input" value={profile.title} onChange={e => setProfile({...profile, title: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Competitor Bio</label>
                  <textarea className="input" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} style={{ minHeight: 60, resize: 'vertical' }} />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary btn-sm">Save Profile</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 className="heading-3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {profile.username}
                      <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-muted)' }}>@{profile.username.toLowerCase()}</span>
                    </h2>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-400)', fontWeight: 'bold', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Award size={12} /> {profile.title}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)}>
                    <Edit3 size={14} style={{ marginRight: 6 }} /> Edit Profile
                  </button>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 12, lineHeight: 1.5, maxWidth: 640 }}>
                  {profile.bio}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Panels Layout */}
        <div className="grid grid-3 gap-6" style={{ alignItems: 'start' }}>
          
          {/* Left Columns: Stats & History */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            {/* Stats Metrics Dashboard Grid */}
            <div className="grid grid-4 gap-4">
              {[
                { label: 'Wins', val: stats.wins, sub: `${stats.matchesPlayed} matches`, icon: Trophy, color: 'var(--gold-400)' },
                { label: 'Songs Sung', val: stats.totalSongs, sub: 'Validated entries', icon: Music, color: 'var(--primary-400)' },
                { label: 'Accuracy', val: `${stats.accuracy}%`, sub: `${stats.totalViolations} violations`, icon: CheckCircle, color: 'var(--success-400)' },
                { label: 'Avg Speed', val: `${stats.avgResponseTime}s`, sub: 'Turn response time', icon: Clock, color: 'var(--secondary-400)' }
              ].map((m, i) => (
                <div key={i} className="card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', justifySpace: 'between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'bold' }}>{m.label}</span>
                    <m.icon size={16} style={{ color: m.color }} />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-display)', color: 'white' }}>
                    {m.val}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: 4 }}>
                    {m.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Favorite Song Genres & Categories */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={18} style={{ color: 'var(--primary-400)' }} />
                Musical Preferences & Performance
              </h3>

              <div className="grid grid-2 gap-6">
                <div>
                  <h5 style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 10 }}>Top Languages</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { lang: stats.favLang, pct: 60, color: 'var(--primary-500)' },
                      { lang: 'English', pct: 25, color: 'var(--secondary-500)' },
                      { lang: 'Punjabi', pct: 15, color: 'var(--accent-500)' }
                    ].map((l, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: 4 }}>
                          <span style={{ fontWeight: 'bold' }}>{l.lang}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{l.pct}%</span>
                        </div>
                        <div className="progress-bar" style={{ height: 6 }}>
                          <div className="progress-fill" style={{ width: `${l.pct}%`, background: l.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 8 }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Favorite Artist</div>
                    <div style={{ fontWeight: 'bold', color: 'white', marginTop: 2, fontSize: '13px' }}>{stats.favArtist}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 8 }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Go-To Movie Soundtrack</div>
                    <div style={{ fontWeight: 'bold', color: 'white', marginTop: 2, fontSize: '12px' }}>{stats.favMovie}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Match History Timeline */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={18} style={{ color: 'var(--primary-400)' }} />
                Match History Timeline
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {displayHistory.map((match, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: `3px solid ${match.result === 'Victory' ? 'var(--success-500)' : 'var(--error-500)'}` }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{match.result} ({match.mode.toUpperCase()})</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {match.songs} songs • {match.rounds} rounds • match_{match.id.slice(0, 4)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${match.result === 'Victory' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '10px' }}>
                        {match.result === 'Victory' ? 'WIN' : 'LOSS'}
                      </span>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 4 }}>
                        {match.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Trophy Room & Theme Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            {/* Trophies Progress Room */}
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 className="heading-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Trophy Hall Progress</h4>
                <span style={{ fontSize: '11px', color: 'var(--gold-400)', fontWeight: 'bold' }}>
                  {stats.unlockedTrophies.length} / 6 Unlocked
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {TROPHY_TIERS.map(t => {
                  const isUnlocked = stats.unlockedTrophies.some(unlocked => unlocked.id === t.id);
                  return (
                    <div
                      key={t.id}
                      title={`${t.name}: ${t.requirement}`}
                      style={{
                        padding: '10px 4px',
                        background: isUnlocked ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 6,
                        textAlign: 'center',
                        opacity: isUnlocked ? 1 : 0.25,
                        filter: isUnlocked ? 'none' : 'grayscale(100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <span style={{ fontSize: '1.6rem' }}>{t.emoji}</span>
                      <span style={{ fontSize: '9px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%', color: 'var(--text-secondary)' }}>
                        {t.name.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual Settings Theme Customizer */}
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <h4 className="heading-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Settings size={14} /> Theme Styles
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 12 }}>
                Change your dashboard background gradients and accent colors.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {themes.map(t => {
                  const isActive = theme === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: isActive ? `1.5px solid ${t.color}` : '1px solid rgba(255,255,255,0.05)',
                        background: 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: isActive ? 'bold' : 'normal', color: isActive ? t.color : 'white' }}>
                        {t.name}
                      </span>
                      <div style={{ width: 14, height: 14, borderRadius: 7, background: t.gradient, border: '1px solid rgba(255,255,255,0.2)' }} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fair play compliance banner */}
            <div style={{
              padding: 12,
              borderRadius: 8,
              border: '1px solid rgba(244,63,94,0.2)',
              background: 'rgba(244,63,94,0.02)',
              display: 'flex',
              gap: 10
            }}>
              <ShieldAlert size={16} style={{ color: 'var(--accent-400)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'white' }}>Fair Play Compliance</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>
                  Your account history shows <strong>97.8%</strong> clean validation compliance. Always match the starting letter!
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
