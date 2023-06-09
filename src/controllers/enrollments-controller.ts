import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import enrollmentsService from '@/services/enrollments-service';
import { notFoundError } from '@/errors';

export async function getEnrollmentByUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const enrollmentWithAddress = await enrollmentsService.getOneWithAddressByUserId(userId);

    return res.status(httpStatus.OK).send(enrollmentWithAddress);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function postCreateOrUpdateEnrollment(req: AuthenticatedRequest, res: Response) {
  try {
    await enrollmentsService.createOrUpdateEnrollmentWithAddress({
      ...req.body,
      userId: req.userId,
    });

    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getAddressFromCEP(req: AuthenticatedRequest, res: Response) {
  const cep = req.query.cep as string;
  try {
    const address = await enrollmentsService.getAddressFromCEP(cep);
    console.log(address);
    if (address.status === 400) {
      return res.status(204).send(notFoundError());
    }
    if (address.data.erro === true) {
      return res.status(204).send(notFoundError());
    }

    const adressInfo = {
      logradouro: address.data.logradouro,
      complemento: address.data.complemento,
      bairro: address.data.bairro,
      cidade: address.data.localidade,
      uf: address.data.uf,
    };

    res.status(httpStatus.OK).send(adressInfo);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.send(httpStatus.NO_CONTENT);
    }
  }
}
