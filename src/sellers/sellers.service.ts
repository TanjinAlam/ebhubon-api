import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from } from 'rxjs';
import { SellerUser } from 'src/sellers/sellerSchema/userSeller.entity';

import { User } from 'src/users/userSchema/user.entity';
import { ObjectID, Repository } from 'typeorm';
import { Seller } from './sellerSchema/seller.entity';
import { SellerInfoInter } from './sellerSchema/seller.interface'
// import mongoose from 'mongoose';
import { ObjectId, ObjectID as ObjID } from 'mongodb'

@Injectable()
export class SellersService {

  constructor(
    @InjectRepository(Seller, 'ebhubon') private readonly sellerRepository: Repository<Seller>,
    @InjectRepository(SellerUser, 'ebhubon') private readonly sellerUserRepository: Repository<SellerUser>,
    @InjectRepository(User, 'ebhubon') private readonly userRepository: Repository<User>) { }



  async delete(id: string) {
    await this.sellerRepository.delete(id);
  }

  async personDetails(_id: string) {
    return await this.sellerRepository.findOne(_id)
    //return this.sellerinfoRepository.update({_id}, data);
  }


  async permission(_id: ObjectID, data: Seller) {
    await this.sellerRepository.update({ _id }, data);
    return await this.sellerRepository.findOne(_id)
    //return this.sellerinfoRepository.update({_id}, data);
  }





  async findAll(): Promise<any> {
    let data = await this.sellerRepository.find()
    return data;
  }

  async create(data: SellerInfoInter): Promise<any> {
    let userData: any = ""
    let sellerData: any = ""

    //data.category.push(datavalue)
    try {

      //creating new user
      const newUser  = new User()
      newUser.username = data.username
      newUser.password = data.password
      newUser.mail = data.mail
      newUser.cellNo = data.cellNo
      newUser.role = "seller-admin"
      newUser.status = "pending"
      newUser.CreatedAt = String(new Date())
      newUser.UpdatedAt = data.mail
      userData = await this.userRepository.save(newUser);

      //creating new seller
      const newSeller = new Seller()
      newSeller.shopName = data.shopName
      newSeller.CreatedAt = String(new Date())
      newSeller.CreatedBy = data.mail
      newSeller.status = "pending"
      newSeller.mail = data.mail
      newSeller.cellNo = data.cellNo
      newSeller.folderName = data.shopName + Date.now()
      sellerData = await this.sellerRepository.save(newSeller);

      const newSellerUser = new SellerUser()
      newSellerUser.userId = String(newUser._id)
      newSellerUser.sellerId = String(newSeller._id)
      await this.sellerUserRepository.save(newSellerUser);
      return sellerData;

    } catch (err) {

      //if any circumstance user is created but failed to create seller
      if(userData){
        this.userRepository.delete(userData._id);
      }
      //if any circumstance seller is created but failed to selleruser 
      if(sellerData){
        this.sellerRepository.save(sellerData._id);
      }
      return err.writeErrors[0].errmsg
    }

  }


  //update
  async update(data: any) {

    console.log("status", data["status"]);


    for (let key in data) {
      if (data.hasOwnProperty(key) && key != "status") {
        data[key].status = data["status"];
        data[key].updatedAt = new Date()
        data[key].updatedBy = data.mail
        //data[key].updatedAt= new Date()


        // let sellerId = new sellers();
        // sellerId._id =data[key]._id;
        // sellerId._id = data[key]._id 
        let _id = data[key]._id;
        // tmp = new ObjID(tmp)
        console.log("_id", _id);
        delete data[key]._id;
        // let x = await this.sellerinfoRepository.update({_id}, data[key]); 
        let x = await this.sellerRepository.findOne(_id);
        //delete x.shopName;
        //delete x.role;
        delete x.status;
        //delete x.cellNo;
        //delete x.mail;

        let xup = await this.sellerRepository.update(x, data[key]);
      }
    }
    return data;
    // console.log("ID====================",_id);
    // await this.sellerinfoRepository.update({_id}, data); 
    // return await this.sellerinfoRepository.findOne(_id)
    //return this.sellerinfoRepository.update({_id}, data);
  }


  async sellerDetail(user: any) {
    var assignedSellerInfo = await this.sellerRepository.findOne(user.sl);
    // console.log("CURRENT SELLER======================",assignedSellerInfo)
    return assignedSellerInfo
  }
}
