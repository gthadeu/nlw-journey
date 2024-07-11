import "dayjs/locale/pt-br";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function confirmParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/participants/:participantId/confirm",
    {
      schema: {
        params: z.object({
          participantId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { participantId } = request.params;

      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId,
        },
      });

      if (!participant) {
        return reply.status(404).send({ message: "Participant not found" });
      }

      if (participant.is_confirmer) {
        return reply.redirect(
          `http://locahost:3000/trips/${participant.trip_id}`
        );
      }

      await prisma.participant.update({
        where: {
          id: participantId,
        },
        data: {
          is_confirmer: true,
        },
      });

      return reply.redirect(
        `http://locahost:3000/trips/${participant.trip_id}`
      );
    }
  );
}
