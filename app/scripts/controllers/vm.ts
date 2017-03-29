/// <reference path="../_all.ts" />

'use strict';

module auroraApp {
    export class VmCtrl  {
        item: VmItem
        volumes: VmVolume[] = []
        currentSection: any = {}
    
        static $inject = [
            "ComputeService",
            "$state",
            "$stateParams",
            "$timeout",
            "Notification"
        ]
        actions: IVmAction[] = [
            {id: "stop", name: "Stop", action: this.haltVm, available: true},
            {id: "start", name: "Start", action: this.startVm, available: true},
            {id: "restart", name: "Restart", action: this.restartVm, available: true}
        ]

        constructor(
            public apiService: Services.ComputeService,
            private $state,
            private $stateParams,
            private $timeout: ng.ITimeoutService,
            private notification: any
        ) {
            
            this.item = <VmItem> apiService.getVm($stateParams.vm_id)
            apiService.vmFlavors.forEach((flavor) => {
                flavor.selected = false
                if (this.item.flavor == flavor)
                    flavor.selected = true
            })
            apiService.project.additional_cost = 0
            
            this.item.network_interfaces = []
            /*apiService.vmVolumes.forEach(volume => {
                if (volume.attached_to && volume.attached_to.vm == this.item)
                    this.volumes.push(volume)
            })*/
            console.log(this.item)
        }

        // TODO: Put network functions in own controller

        addInterface(network_obj:INetwork) {
            this.apiService.serverAttachInterface(this.item, network_obj).then(response => {
                this.notification.success("Network interface has been attached")
            })
            
    
            /*let newLink = {from: "network_" + network_interface.network.name, to: 'vm' + '_' + this.item.id, type: "uni", connector: "metro"}
            if (window['mapDetails']['links'].indexOf(newLink) == -1)
                window['mapDetails']['links'].push(newLink)*/
        }

        removeInterface(port: IPort) {
            this.apiService.deletePortInterface(this.item, port).then(response => {
                this.notification.success("Port interface deleted.")
            })
            
            /*let newLink = {from: "network_" + networkInterface.network.name, to: 'vm' + '_' + this.item.id, type: "uni", connector: "metro"}
            index = window['mapDetails']['links'].indexOf(newLink)
            if (index > -1)
                window['mapDetails']['links'].splice(index, 1)*/
        }

        availableFloatingIps(floating_ip: IFloatingIp) {
            return floating_ip.assigned_to == null
        }

        selectFloatingIp(floatingIp: IFloatingIp, networkInterface:INetworkInterface) {
            networkInterface.floating_ip = floatingIp
            floatingIp.assigned_to = networkInterface
        }

        releaseFloatingIp(network_interface: INetworkInterface) {
            network_interface.floating_ip.assigned_to = null
            network_interface.floating_ip = null
        }
    
        renameVm(data) {
            this.apiService.updateServerName(this.item, data).then(response => this.notification.info("Name updated"));
        }
        
        detachVolume(volume)
        {
            this.apiService.detachVolume(volume, this.item.id).then((response) => {
                this.notification.info("Volume has been detached")
                let index = this.item.volumes.indexOf(volume)
                this.item.volumes.splice(index, 1)
            })
        }

        createSnapshot() {
            let name = this.item.name + "_sp_" + (this.item.snapshots.length + 1)
            let id = Math.floor((Math.random() * 1000) + 1) + " " + Math.floor((Math.random() * 1000) + 1)
            let snapshot = new VmSnapshot(id, name, this.item.flavor.ssd, this.item.zone, new Date())
            
            this.item.snapshots.push(snapshot)
            
            this.apiService.vmSnapshots.push(snapshot)
            
            this.apiService.updateVm(this.item)
        }

        deleteSnapshot(obj: VmSnapshot) {
            let index = this.item.snapshots.indexOf(obj);
            this.item.snapshots.splice(index, 1); 

            this.apiService.updateVm(this.item)
        }

        haltVm() 
        {
            this.item.host_status = "stopped"
        }

        startVm()
        {
            this.item.host_status = "running"
        }

        restartVm()
        {
            console.log(this)
            this.item.host_status = "restarting"
            this.$timeout(() => {
                this.item.host_status = "running"
            }, 7000)
        }

        selectAction(action: IVmAction, vm: VmItem)
        {
            console.log(action, vm)
            action.action()
        }
    }
}

angular.module('auroraApp')
  .controller('VmCtrl', auroraApp.VmCtrl)