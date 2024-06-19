import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetStatus } from 'src/app/base/sweet-alert/sweet-alert-status';
import { SweetAlertService } from 'src/app/services/admin/sweet-alert.service';
import { RoomService } from 'src/app/services/common/models/room.service';
import { AddRoom } from 'src/app/shared/models/rooms/add-room';
import { ListRoom } from 'src/app/shared/models/rooms/list-room';
import { UpdateRoom } from 'src/app/shared/models/rooms/update-room';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit{
  @ViewChild("roomForm", { static: true }) roomForm: NgForm;
  @Input() data!: { roomTypeId: number };
  listRooms: ListRoom[] = [];
  updateRoom: UpdateRoom;
  showCreateFormFlag : boolean;
  editRoomId: number | null;
  roomTypeId!: number;
  addRoom: AddRoom;

  constructor(
    private roomService: RoomService, 
    private sweetAlertService:SweetAlertService,
    private activeModal: NgbActiveModal){}

  ngOnInit(): void {
    this.getRooms();
  }

  async getRooms() {
    if (this.data && this.data.roomTypeId) {
      this.roomTypeId = this.data.roomTypeId;
    return this.roomService.getRoomsByRoomTypeId(this.data.roomTypeId).then(roomsData => {
      this.listRooms = roomsData as ListRoom[];
      console.log(this.listRooms);
    });
  }
  }

  onSubmit() {
    if (!this.roomForm.valid)
      return;

    const formData = this.roomForm.value;
    const roomType = this.addRoom = {
      roomTypeId : this.roomTypeId,
      no: formData.no,
      available: formData.available,
    };
    this.roomService.create(roomType, async () => {
      await this.sweetAlertService.showAlert(SweetStatus.sweetSucces);
      this.getRooms();
    }, error => {
    });
  }

  showCreateForm() { 
    this.showCreateFormFlag = !this.showCreateFormFlag;
}

showUpdateForm(roomId: number) { 
  const roomItem = this.listRooms.find(item => item.id === roomId);
  if (roomItem) {
    this.editRoomId = roomId;
    this.updateRoom.roomTypeId = roomItem.roomTypeId;
    this.updateRoom.no = roomItem.no;
    this.updateRoom.available = roomItem.available;
    this.showCreateFormFlag = false;
  }
}

  update(roomId: number, action: string,) {
    if (action === 'check' && this.roomForm.valid && this.editRoomId) {
      const category = {
        id: roomId,
        roomTypeId: this.roomTypeId,
        no: this.updateRoom.no,
        available: this.updateRoom.available

      };

      this.roomService.update(category, ()=>{
        this.sweetAlertService.showAlert(SweetStatus.sweetSucces);
      },
      error => {
     })
      .then(() => {
        this.getRooms();
        this.editRoomId = null;
      });
    }
    else if (action === 'cancel') {
      this.editRoomId = null;
    }
    this.getRooms();
  }

  async delete(roomId: number) {
    const sweetAlertResult = await this.sweetAlertService.showAlert(SweetStatus.deletedQuestion);
    if(sweetAlertResult.isConfirmed){
      this.roomService.delete(roomId, ()=>{
        this.sweetAlertService.showAlert(SweetStatus.sweetSucces);
      },
      error => {
     })
      .then(() => {
        this.getRooms();
      });
    }
  }

  close() {
    this.activeModal.close();
  }
}
