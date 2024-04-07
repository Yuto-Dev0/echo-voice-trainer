"use client";

import {
  Blockquote,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Progress,
  Separator,
  Slider,
  Text,
} from "@radix-ui/themes";
import InfoBox from "../components/InfoBox.tsx";
import Image from "next/image.js";
import React, { useRef } from "react";
import { useEffect, useState } from "react";
export default function Main() {
  const [length, setLength] = useState("0:00");
  const [permission, setPermission] = useState(false);
  const [isRecording, setRecordingState] = useState(false);
  const [audio, setAudio] = useState("");
  const [audioChunks, setAudioChunks]: [
    Blob[] | undefined,
    React.Dispatch<React.SetStateAction<Blob[] | undefined>>
  ] = useState();
  const mediaRecorder = useRef<MediaRecorder>();
  const mediaStream = useRef<MediaStream>();
  async function getStreamData() {
    const streamData = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    setPermission(true);
    mediaStream.current = streamData;
  }
  useEffect(() => {
    if ("MediaRecorder" in window) {
      getStreamData()
        .then((data) => {
          if (mediaStream.current) {
            mediaRecorder.current = new MediaRecorder(mediaStream.current, {
              mimeType: "audio/webm",
            });
          }
        })
        .catch(console.error);
    }
  }, []);

  function startRecording() {
    if (mediaRecorder.current && !isRecording) {
      mediaRecorder.current.start();
      setRecordingState(true);
      console.log("Recording Started");
      let localAudioChunks: Blob[] = [];
      mediaRecorder.current.ondataavailable = (event) => {
        if (typeof event.data === "undefined") return;
        if (event.data.size === 0) return;
        localAudioChunks.push(event.data);
      };
      setAudioChunks(localAudioChunks);
    }
  }

  function stopRecording() {
    if (isRecording && mediaRecorder.current) {
      setRecordingState(false);
      mediaRecorder.current.stop();
      mediaRecorder.current.onstop = () => {
        setAudio(
          URL.createObjectURL(new Blob(audioChunks, { type: "audio/webm" }))
        );
        setAudioChunks([]);
        console.log("Recording Stopped");
      };
    }
  }

  return (
    <Flex
      as="div"
      direction="column"
      align="center"
      justify="center"
      height="100vh"
      m="3"
    >
      <audio src={audio} autoPlay />
      <Heading>Echo</Heading>
      <Heading m="4">-Simplest Voice Training App-</Heading>
      <Box minWidth="40vw" maxWidth="60vw">
        <Card size="1">
          <Flex direction="row" align="center" justify="center" gap="4">
            <Separator size="4" orientation="vertical" />
            <Flex
              align="center"
              gap="3"
              direction="column"
              minWidth="50%"
              my="4"
            >
              {/* Control Buttons */}
              <Flex gap="2" m="2" justify="center">
                <Button onClick={startRecording}>Record</Button>
                <Separator size="2" orientation="vertical" />
                <Button onClick={stopRecording}>Stop</Button>
                <Separator size="2" orientation="vertical" />
                <Button>Play</Button>
                <Separator size="2" orientation="vertical" />
                <Dialog.Root>
                  <Dialog.Trigger>
                    <Button>Set Loop</Button>
                  </Dialog.Trigger>
                  <Dialog.Content>
                    <Flex direction="column" gap="3">
                      <label>
                        <Text></Text>
                      </label>
                    </Flex>
                  </Dialog.Content>
                </Dialog.Root>
              </Flex>
              <Separator size="4" />
              <Flex
                direction="row"
                align="center"
                justify="center"
                width="100%"
                gap="1"
              >
                <Box minWidth="60%">
                  <Progress value={0} size="2" />
                </Box>
                <Text size="2">{length}</Text>
                <Separator orientation="vertical" />
                <Box minWidth="20%">
                  <Slider defaultValue={[30]} size="1" />
                </Box>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      </Box>
    </Flex>
  );
}
