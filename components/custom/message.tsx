"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { NoteCard } from "../notes/note";

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  console.log("Tool invocations:", toolInvocations);
  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {content && typeof content === "string" && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content}</Markdown>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;
              console.log("1. toolInvocations exist:", toolInvocations);
              console.log("2. Processing tool:", {
                toolName,
                state,
                toolCallId,
              });

              if (state === "result") {
                const { result } = toolInvocation;
                console.log("3. Tool has result:", { toolName, result });
                console.log("Tool invocation:", { toolName, result });
                console.log("--------------------------------");

                return (
                  <div key={toolCallId}>
                    {toolName === "generateNote" ? (
                      <NoteCard chatId={chatId} note={result.note} />
                    ) : toolName === "showLatestNote" ? (
                      result.success ? (
                        <NoteCard chatId={chatId} note={result.note} />
                      ) : (
                        <div className="bg-card border rounded-xl p-4 text-muted-foreground">
                          {result.error || "No notes found"}
                        </div>
                      )
                    ) : (
                      <div>{JSON.stringify(result, null, 2)}</div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId} className="skeleton">
                    {toolName === "generateNote" ? (
                      <NoteCard chatId={chatId} />
                    ) : toolName === "showLatestNote" ? (
                      <NoteCard chatId={chatId} />
                    ) : null}
                  </div>
                );
              }
            })}
          </div>
        )}

        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
