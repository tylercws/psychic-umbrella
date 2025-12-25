import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { TrackDetailHeader } from "./TrackDetailHeader";
import { TrackWaveformBlock } from "./TrackWaveformBlock";
import { TrackCueList } from "./TrackCueList";
import { TrackMetricsPanels } from "./TrackMetricsPanels";
import { TrackActionDock } from "./TrackActionDock";
import { formatTime } from "./trackDetailUtils";
import { Cue } from "./types";

const baseCue: Cue = {
  id: "cue-1",
  label: "INTRO_MARK",
  time: "0:10",
  color: "#fff",
};

describe("Track detail components", () => {
  it("renders header with track metadata", () => {
    render(
      <MemoryRouter>
        <TrackDetailHeader id="abc" meta={{ title: "Song", artist: "Artist" }} />
      </MemoryRouter>
    );

    expect(screen.getByText("Song")).toBeInTheDocument();
    expect(screen.getByText("Artist")).toBeInTheDocument();
    expect(screen.getByText("[RETURN_DASHBOARD]")).toBeInTheDocument();
  });

  it("shows selected cue intel inside waveform block", () => {
    render(
      <TrackWaveformBlock
        waveformPoints={[0.1, 0.2, 0.15]}
        cues={[baseCue]}
        stems={{}}
        stemUrls={{}}
        midiUrls={{}}
        audioUrl=""
        vocalUrl=""
        percUrl=""
        selectedCue={{ ...baseCue, duration: 12, type: "range", endTime: 22 }}
        onCueClick={() => {}}
        formatTime={formatTime}
        layoutId="wave-1"
      />
    );

    expect(screen.getByText("SECTION_INTEL")).toBeInTheDocument();
    expect(screen.getByText("INTRO_MARK")).toBeInTheDocument();
    expect(screen.getByText("12s")).toBeInTheDocument();
  });

  it("renders cue list and fires selection callback", () => {
    const onSelectCue = vi.fn();
    render(
      <TrackCueList
        cues={[baseCue]}
        onSelectCue={onSelectCue}
        stems={{ vocal: [], bass: [] }}
        danceability={64}
        loudness={-12}
      />
    );

    fireEvent.click(screen.getByText(baseCue.time));
    expect(onSelectCue).toHaveBeenCalledWith(baseCue);
    expect(screen.getByText("LOUDNESS / DANCEABILITY")).toBeInTheDocument();
  });

  it("renders metrics panels with mix points and descriptors", () => {
    render(
      <TrackMetricsPanels
        mixPoints={{ intro_end: 45, drop: "1:12", outro_start: 180 }}
        descriptors={{ contrast: "BRIGHT", dynamic_range: 10 }}
        danceability={80}
        loudness={-8}
        texture="silky"
        color="blue"
      />
    );

    expect(screen.getByText(formatTime(45))).toBeInTheDocument();
    expect(screen.getByText("BRIGHT")).toBeInTheDocument();
    expect(screen.getByText("10 dB")).toBeInTheDocument();
  });

  it("exposes actions through action dock", () => {
    const onReAnalyze = vi.fn();
    render(
      <TrackActionDock
        isAnalyzing={false}
        meta={{ filename: "track.wav" }}
        progressMessage=""
        onReAnalyze={onReAnalyze}
        autoReveal
        setAutoReveal={() => {}}
        showDust
        setShowDust={() => {}}
      />
    );

    fireEvent.click(screen.getByText("RUN STEM SPLIT"));
    expect(onReAnalyze).toHaveBeenCalledWith("track.wav", "htdemucs_ft");
  });
});
